import { streamText, convertToModelMessages } from 'ai'
import { model } from '@/lib/ai/groqClient'
import { CONVERSATION_ENGINE_PROMPT } from '@/lib/ai/prompts/conversationEngine'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  try {
    const body = await req.json()
    const messages = body?.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response('Bad Request: missing messages', { status: 400 })
    }

    const url = new URL(req.url)
    const traitProfileId = url.searchParams.get('trait_profile_id')
    const sessionId = url.searchParams.get('session_id')

    const admin = createAdminClient()

    // ── Returning student context injection ──────────────────────────────
    let systemPrompt = CONVERSATION_ENGINE_PROMPT

    if (traitProfileId) {
      try {
        const { data: traitProfile } = await admin
          .from('trait_profiles')
          .select('*')
          .eq('id', traitProfileId)
          .eq('user_id', user.id)
          .single()

        if (traitProfile) {
          const profileSummary = [
            traitProfile.profile_type ? `Profile type: ${traitProfile.profile_type}` : null,
            traitProfile.strengths?.length ? `Key strengths: ${(traitProfile.strengths as string[]).join(', ')}` : null,
            traitProfile.interests?.length ? `Interests: ${(traitProfile.interests as string[]).join(', ')}` : null,
            traitProfile.learning_style ? `Learning style: ${traitProfile.learning_style}` : null,
            traitProfile.raw_summary ? `Previous summary: ${traitProfile.raw_summary}` : null,
          ].filter(Boolean).join('\n')

          systemPrompt = `${CONVERSATION_ENGINE_PROMPT}

---
RETURNING STUDENT CONTEXT:
This student has already completed an initial discovery session. Below is their existing trait profile. Use this as a foundation — do not re-ask questions they have already answered. Instead, deepen the conversation, explore any gaps, verify whether their goals or circumstances have changed, and update the profile accordingly.

${profileSummary}
---`
        }
      } catch {
        // If fetching the trait profile fails, continue without it
      }
    }

    // ── Save the latest user message to the session ──────────────────────
    if (sessionId) {
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')
      if (lastUserMsg) {
        const userText = lastUserMsg.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text ?? '').join('')
          ?? (typeof lastUserMsg.content === 'string' ? lastUserMsg.content : '')
        if (userText) {
          await admin.from('conversation_messages').insert({
            session_id: sessionId,
            sender: 'student',
            message: userText,
            timestamp: new Date().toISOString(),
          })
        }
      }
    }

    const convertedMessages = await convertToModelMessages(messages)

    const result = await streamText({
      model,
      system: systemPrompt,
      messages: convertedMessages,
      temperature: 0.7,
      onFinish: async ({ text }) => {
        if (!sessionId || !text) return
        // Save AI response (strip the PROFILE_READY sentinel from the stored text)
        const cleanText = text.replace(/<<PROFILE_READY>>/g, '').trim()
        await admin.from('conversation_messages').insert({
          session_id: sessionId,
          sender: 'assistant',
          message: cleanText,
          timestamp: new Date().toISOString(),
        })
        // Mark session completed when PROFILE_READY token is present
        if (text.includes('<<PROFILE_READY>>')) {
          await admin
            .from('conversation_sessions')
            .update({ status: 'completed', ended_at: new Date().toISOString() })
            .eq('id', sessionId)
        }
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Conversation engine error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
