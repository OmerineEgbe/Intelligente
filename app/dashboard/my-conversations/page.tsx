import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, MessageSquare, Clock, ChevronRight } from 'lucide-react'

export default async function MyConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('conversation_sessions')
    .select('id, status, started_at, ended_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">My Conversations</h1>
      <p className="text-[#64748b] text-sm mb-8">Your complete conversation history. Click any session to read the full transcript.</p>

      {!sessions || sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center">
          <MessageSquare size={36} className="text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[#94a3b8] mb-4">No conversations yet.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] transition-colors">
            Start a Conversation <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, idx) => {
            const date = new Date(session.started_at)
            const sessionNum = sessions.length - idx
            return (
              <Link
                key={session.id}
                href={`/dashboard/my-conversations/${session.id}`}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex items-center justify-between hover:border-[#1a3461] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0 group-hover:bg-[#bfdbfe] transition-colors">
                    <span className="text-xs font-bold text-[#1a3461]">{sessionNum}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0c1f4a]">Discovery Session #{sessionNum}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock size={11} className="text-[#94a3b8]" />
                      <span className="text-xs text-[#94a3b8]">
                        {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${session.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-[#fef3c7] text-yellow-700'}`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#94a3b8] group-hover:text-[#0c1f4a] transition-colors" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
