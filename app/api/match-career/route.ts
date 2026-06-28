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
      prompt: `Match this student trait profile to LMUI programmes and careers:\n\n${JSON.stringify(trait_profile, null, 2)}`,
      temperature: 0.1,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in career matching response')
    const matchResult = JSON.parse(jsonMatch[0])

    // Save recommendations to Supabase
    const admin = createAdminClient()
    const savedRecs = []

    for (const match of matchResult.matches) {
      const { data: rec, error } = await admin
        .from('recommendations')
        .insert({
          user_id: user.id,
          trait_profile_id,
          fit_verdict: match.fit_verdict,
          score: match.fit_verdict === 'strong_fit' ? 90 : match.fit_verdict === 'conditional_fit' ? 65 : 30,
          explanation: JSON.stringify({
            programme_name: match.programme_name,
            career_name: match.career_name,
            reasoning: match.reasoning,
            qualification_pathway: match.qualification_pathway,
          }),
          is_alternative: !match.is_primary,
        })
        .select()
        .single()

      if (!error && rec) savedRecs.push({ ...rec, match_data: match })
    }

    return Response.json({
      recommendations: savedRecs,
      matches: matchResult.matches,
    })
  } catch (error) {
    console.error('Career matching error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
