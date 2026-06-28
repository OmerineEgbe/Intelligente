import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Map, Clock, Calendar, Flag } from 'lucide-react'

export default async function RoadmapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!roadmap) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0c1f4a] mb-2">Your Roadmap</h1>
        <p className="text-[#64748b] mb-8">Your personalised action plan will appear here after your conversation.</p>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center">
          <Map size={36} className="text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[#94a3b8] mb-4">No roadmap yet.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] transition-colors">
            Start a Conversation <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const immediate = roadmap.immediate_actions as any[] ?? []
  const shortTerm = roadmap.short_term_actions as any[] ?? []
  const longTerm = roadmap.long_term_actions as any[] ?? []

  const sections = [
    { label: 'Immediate', sublabel: 'Next 2–4 weeks', icon: Clock, actions: immediate, color: 'bg-[#dbeafe]', textColor: 'text-[#1a3461]' },
    { label: 'Short-term', sublabel: 'Next 3–6 months', icon: Calendar, actions: shortTerm, color: 'bg-[#dcfce7]', textColor: 'text-green-800' },
    { label: 'Long-term', sublabel: 'Full pathway', icon: Flag, actions: longTerm, color: 'bg-[#fef3c7]', textColor: 'text-yellow-800' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Your Roadmap</h1>
      <p className="text-[#64748b] text-sm mb-8">Concrete, specific steps tailored to your match.</p>

      <div className="space-y-6">
        {sections.map(({ label, sublabel, icon: Icon, actions, color, textColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className={`px-5 py-4 border-b border-[#e2e8f0] flex items-center gap-3 ${color}`}>
              <Icon size={18} className={textColor} />
              <div>
                <h2 className={`font-semibold text-sm ${textColor}`}>{label}</h2>
                <p className={`text-xs ${textColor} opacity-70`}>{sublabel}</p>
              </div>
            </div>
            <div className="p-5">
              {actions.length === 0 ? (
                <p className="text-sm text-[#94a3b8]">No actions in this section.</p>
              ) : (
                <ol className="space-y-4">
                  {actions.map((action: any, i: number) => (
                    <li key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[11px] font-bold text-[#0c1f4a] flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0c1f4a]">{action.action}</p>
                        {action.detail && <p className="text-sm text-[#64748b] mt-0.5">{action.detail}</p>}
                        {action.timeframe && (
                          <span className="inline-block mt-1 text-xs text-[#94a3b8]">{action.timeframe}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
