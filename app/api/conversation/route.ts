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

    // ── Returning student context injection ──────────────────────────────
    const url = new URL(req.url)
    const traitProfileId = url.searchParams.get('trait_profile_id')

    let systemPrompt = CONVERSATION_ENGINE_PROMPT

    if (traitProfileId) {
      try {
        const admin = createAdminClient()
        const { data: traitProfile } = await admin
          .from('trait_profiles')
          .select('*')
          .eq('id', traitProfileId)
          .eq('user_id', user.id) // safety check — ensure profile belongs to this user
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

    const convertedMessages = await convertToModelMessages(messages)

    const result = await streamText({
      model,
      system: systemPrompt,
      messages: convertedMessages,
      temperature: 0.7,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Conversation engine error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
