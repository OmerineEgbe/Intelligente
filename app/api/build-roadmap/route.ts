import { generateText } from 'ai'
import { model } from '@/lib/ai/groqClient'
import { ROADMAP_ENGINE_PROMPT } from '@/lib/ai/prompts/roadmapEngine'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  try {
    const { primary_match, recommendation_id } = await req.json()
    if (!primary_match || !recommendation_id) {
      return new Response('Bad Request', { status: 400 })
    }

    const { text } = await generateText({
      model,
      system: ROADMAP_ENGINE_PROMPT,
      prompt: `Build a roadmap for this confirmed match:\n\n${JSON.stringify(primary_match, null, 2)}`,
      temperature: 0.2,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in roadmap response')
    const roadmapData = JSON.parse(jsonMatch[0])

    const admin = createAdminClient()
    const { data: roadmap, error } = await admin
      .from('roadmaps')
      .insert({
        user_id: user.id,
        recommendation_id,
        immediate_actions: roadmapData.immediate_actions,
        short_term_actions: roadmapData.short_term_actions,
        long_term_actions: roadmapData.long_term_actions,
      })
      .select()
      .single()

    if (error) throw error

    return Response.json({ roadmap, roadmap_data: roadmapData })
  } catch (error) {
    console.error('Roadmap engine error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
