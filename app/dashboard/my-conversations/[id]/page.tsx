import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BrainCircuit } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ConversationDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify this session belongs to the current user
  const { data: session } = await supabase
    .from('conversation_sessions')
    .select('id, status, started_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  const { data: messages } = await supabase
    .from('conversation_messages')
    .select('sender, message, timestamp')
    .eq('session_id', id)
    .order('timestamp', { ascending: true })

  const date = new Date(session.started_at).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const userInitial = (user.user_metadata?.full_name ?? user.email ?? 'U').charAt(0).toUpperCase()

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/my-conversations"
          className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0c1f4a] transition-colors"
        >
          <ArrowLeft size={15} />
          My Conversations
        </Link>
        <span className="text-[#e2e8f0]">/</span>
        <span className="text-sm text-[#0c1f4a] font-medium">Discovery Session</span>
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0c1f4a] mb-1">Discovery Session</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748b]">{date}</span>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${session.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-[#fef3c7] text-yellow-700'}`}>
            {session.status}
          </span>
        </div>
      </div>

      {!messages || messages.length === 0 ? (
        <p className="text-[#94a3b8] text-sm text-center py-12">No messages recorded for this session.</p>
      ) : (
        <div className="space-y-5">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'student'
            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${isUser ? 'bg-[#0c1f4a] text-white' : 'bg-[#dbeafe] text-[#1a3461]'}`}>
                  {isUser ? userInitial : <BrainCircuit size={14} />}
                </div>
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-[#0c1f4a] text-white rounded-tr-sm' : 'bg-[#f1f5f9] text-[#0c1f4a] rounded-tl-sm border border-[#e2e8f0]'}`}>
                  {msg.message}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
