import { generateText } from 'ai'
import { model } from '@/lib/ai/groqClient'
import { CAREER_MATCHING_PROMPT } from '@/lib/ai/prompts/careerMatching'
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

    const { text } = await generateText({
      model,
      system: CAREER_MATCHING_PROMPT,
      prompt: `Analyse this student trait profile and produce the three-phase career and degree match:\n\n${JSON.stringify(trait_profile, null, 2)}`,
      temperature: 0.1,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in career matching response')
    const result = JSON.parse(jsonMatch[0])

    const { career_matches, degree_field, lmui_match, other_matches } = result

    const primaryCareer = career_matches?.find((m: any) => m.is_primary) ?? career_matches?.[0]
    const fitVerdict = primaryCareer?.fit_verdict === 'strong' ? 'strong_fit'
      : primaryCareer?.fit_verdict === 'conditional' ? 'conditional_fit'
      : 'misaligned'

    // Save as a single recommendations row with full jsonb payload
    const admin = createAdminClient()
    const { data: rec, error } = await admin
      .from('recommendations')
      .insert({
        user_id: user.id,
        trait_profile_id,
        fit_verdict: fitVerdict,
        score: primaryCareer?.match_score ?? 0,
        explanation: primaryCareer?.description ?? '',
        is_alternative: false,
        // New universal match columns
        career_matches,
        degree_field,
        lmui_match,
        other_matches,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to save recommendation: ${error.message}`)

    // Log unmatched degree fields for admin analytics
    if (lmui_match && !lmui_match.available && lmui_match.unmatched_field) {
      await admin.from('analytics').insert({
        metric_name: `unmatched_degree_field:${lmui_match.unmatched_field}`,
        metric_value: 1,
      }).then(() => {}) // fire and forget
    }

    return Response.json({
      recommendation: rec,
      recommendations: [rec],
      matches: career_matches,
      degree_field,
      lmui_match,
    })
  } catch (error) {
    console.error('Career matching error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
