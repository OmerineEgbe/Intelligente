import { streamText, convertToModelMessages } from 'ai'
import { model } from '@/lib/ai/groqClient'
import { CONVERSATION_ENGINE_PROMPT } from '@/lib/ai/prompts/conversationEngine'
import { createClient } from '@/lib/supabase/server'

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

    const convertedMessages = await convertToModelMessages(messages)

    const result = await streamText({
      model,
      system: CONVERSATION_ENGINE_PROMPT,
      messages: convertedMessages,
      temperature: 0.7,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Conversation engine error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
