import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/session?session_id=X  — load messages for a session (for continuation)
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const url = new URL(req.url)
  const sessionId = url.searchParams.get('session_id')
  if (!sessionId) return Response.json({ messages: [] })

  const admin = createAdminClient()

  // Verify the session belongs to this user
  const { data: session } = await admin
    .from('conversation_sessions')
    .select('id, user_id, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return Response.json({ messages: [] })

  const { data: rows } = await admin
    .from('conversation_messages')
    .select('id, sender, message, timestamp')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true })

  // Convert DB rows to UIMessage format for useChat's initialMessages
  const messages = (rows ?? []).map((row, i) => ({
    id: row.id ?? String(i),
    role: row.sender === 'student' ? 'user' : 'assistant',
    content: row.message ?? '',
    parts: [{ type: 'text', text: row.message ?? '' }],
  }))

  return Response.json({ messages, session_id: sessionId })
}

// POST /api/session  — create a new conversation session
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const admin = createAdminClient()
  const { data: session, error } = await admin
    .from('conversation_sessions')
    .insert({
      user_id: user.id,
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) return new Response('Failed to create session', { status: 500 })

  return Response.json({ session_id: session.id })
}
