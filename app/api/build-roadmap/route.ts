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
    const { primary_match, primary_institution, recommendation_id } = await req.json()
    if (!primary_match || !recommendation_id) {
      return new Response('Bad Request', { status: 400 })
    }

    const { text } = await generateText({
      model,
      system: ROADMAP_ENGINE_PROMPT,
      prompt: `Build a roadmap for this student.\n\nPrimary career match:\n${JSON.stringify(primary_match, null, 2)}\n\nPrimary institution match:\n${JSON.stringify(primary_institution ?? {}, null, 2)}`,
      temperature: 0.2,
    })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in roadmap response')
    const roadmapData = JSON.parse(jsonMatch[0])

    // Build career-level pathway steps using the degree field, not institution programme names.
    // Institution-specific programme names should only appear if a user explicitly selects a university.
    const degreeField = primary_match.degree_field ?? primary_match.career_name
    const genericQualifications = [
      { name: 'HND', field: degreeField, duration: '2 Years' },
      { name: 'Top-Up BTech', field: degreeField, duration: '1 Year' },
      { name: 'BTech', field: degreeField, duration: 'Final Year' },
    ]

    const careerDest = roadmapData.career_destination ?? {}

    // Build the full pathway object for the roadmap page
    const pathway = {
      qualifications: genericQualifications,
      immediate_actions: roadmapData.immediate_actions ?? [],
      semester_plan: roadmapData.semester_plan ?? [],
      long_term: roadmapData.long_term ?? [],
      career_destination: {
        title: primary_match.career_name,
        description: primary_match.description ?? '',
        salary_entry: careerDest.salary_entry ?? primary_match.typical_salary ?? '',
        salary_mid: careerDest.salary_mid ?? '',
        salary_senior: careerDest.salary_senior ?? '',
        industries: careerDest.industries ?? [],
      },
    }

    const admin = createAdminClient()
    const { data: roadmap, error } = await admin
      .from('roadmaps')
      .insert({
        user_id: user.id,
        recommendation_id,
        immediate_actions: roadmapData.immediate_actions,
        short_term_actions: roadmapData.semester_plan,
        long_term_actions: roadmapData.long_term,
        pathway,
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
