import { generateText } from 'ai'
import { model } from '@/lib/ai/groqClient'
import { buildCareerMatchingPrompt, buildInstitutionKnowledge } from '@/lib/ai/prompts/careerMatching'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  try {
    const { trait_profile, trait_profile_id } = await req.json()
    if (!trait_profile || !trait_profile_id) {
      return new Response('Bad Request', { status: 400 })
    }

    const admin = createAdminClient()

    // ── Fetch all universities + schools + programmes from DB ──
    // This is what makes the system scalable: new universities are added
    // to the DB and automatically included in the next recommendation run.
    const { data: universities, error: uniError } = await admin
      .from('universities')
      .select(`
        id, name, short_name, country, status,
        schools (
          id, name,
          programmes (
            id, name, qualification, duration, entry_requirements, status
          )
        )
      `)
      .order('name')

    if (uniError) {
      console.error('Failed to fetch universities:', uniError)
    }

    // Build the dynamic institution knowledge block
    const institutionKnowledge = buildInstitutionKnowledge(universities ?? [])
    const systemPrompt = buildCareerMatchingPrompt(institutionKnowledge)

    // ── Run the AI matching ────────────────────────────────────
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: `Analyse this student trait profile and produce the three-phase career and degree match:\n\n${JSON.stringify(trait_profile, null, 2)}`,
      temperature: 0.1,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in career matching response')
    const result = JSON.parse(jsonMatch[0])

    const { career_matches, degree_field, institution_matches, other_matches } = result

    const primaryCareer = career_matches?.find((m: any) => m.is_primary) ?? career_matches?.[0]
    const fitVerdict = primaryCareer?.fit_verdict === 'strong' ? 'strong_fit'
      : primaryCareer?.fit_verdict === 'conditional' ? 'conditional_fit'
      : 'misaligned'

    // Primary institution match (first available one)
    const primaryInstitution = institution_matches?.find((m: any) => m.available) ?? institution_matches?.[0]

    // ── Save recommendation row ────────────────────────────────
    const { data: rec, error: recError } = await admin
      .from('recommendations')
      .insert({
        user_id: user.id,
        trait_profile_id,
        fit_verdict: fitVerdict,
        score: primaryCareer?.match_score ?? 0,
        explanation: primaryCareer?.description ?? '',
        is_alternative: false,
        career_matches,
        degree_field,
        lmui_match: primaryInstitution ?? null, // keep for backward compat
        institution_matches,
        other_matches,
      })
      .select()
      .single()

    if (recError) throw new Error(`Failed to save recommendation: ${recError.message}`)

    // ── Log unmatched degree fields to analytics ───────────────
    const unmatchedFields = institution_matches
      ?.filter((m: any) => !m.available && m.unmatched_field)
      ?.map((m: any) => m.unmatched_field) ?? []

    for (const field of unmatchedFields) {
      await admin.from('analytics').insert({
        metric_name: `unmatched_degree_field:${field}`,
        metric_value: 1,
      }).then(() => {})
    }

    return Response.json({
      recommendation: rec,
      recommendations: [rec],
      matches: career_matches,
      degree_field,
      institution_matches,
      // Primary institution for roadmap builder
      primary_institution: primaryInstitution,
    })
  } catch (error) {
    console.error('Career matching error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
