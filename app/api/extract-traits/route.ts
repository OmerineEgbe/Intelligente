import { generateText } from 'ai'
import { model } from '@/lib/ai/groqClient'
import { TRAIT_EXTRACTION_PROMPT } from '@/lib/ai/prompts/traitExtraction'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  try {
    const { messages, sessionId } = await req.json()
    if (!Array.isArray(messages)) {
      return new Response('Bad Request', { status: 400 })
    }

    // Format transcript for the extraction engine
    const getMessageText = (m: any): string => {
      // ai v7 UIMessage uses parts[]
      if (m.parts && Array.isArray(m.parts)) {
        return m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
      }
      if (typeof m.content === 'string') return m.content
      if (Array.isArray(m.content)) {
        return m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
      }
      return ''
    }

    const transcript = messages
      .map((m: any) => {
        const role = m.role === 'user' ? 'Student' : 'Intelligente'
        return `${role}: ${getMessageText(m)}`
      })
      .join('\n\n')

    const { text } = await generateText({
      model,
      system: TRAIT_EXTRACTION_PROMPT,
      prompt: `Extract the trait profile from this conversation transcript:\n\n${transcript}`,
      temperature: 0.1,
    })

    // Parse and validate JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in trait extraction response')
    const traitProfile = JSON.parse(jsonMatch[0])

    // Save session to Supabase
    const admin = createAdminClient()

    // Create conversation session record
    const { data: session, error: sessionError } = await admin
      .from('conversation_sessions')
      .insert({
        user_id: user.id,
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Save each message
    const messageRows = messages.map((m: any) => ({
      session_id: session.id,
      sender: m.role === 'user' ? 'student' : 'assistant',
      message: getMessageText(m),
    }))
    await admin.from('conversation_messages').insert(messageRows)

    // Save trait profile
    const { data: savedProfile, error: profileError } = await admin
      .from('trait_profiles')
      .insert({
        session_id: session.id,
        user_id: user.id,
        profile_type: traitProfile.profile_type,
        trait_scores: traitProfile.trait_scores,
        top_strengths: traitProfile.top_strengths,
        stated_ambition: traitProfile.stated_ambition ?? null,
      })
      .select()
      .single()

    if (profileError) throw profileError

    return Response.json({
      session_id: session.id,
      trait_profile_id: savedProfile.id,
      trait_profile: traitProfile,
    })
  } catch (error) {
    console.error('Trait extraction error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
