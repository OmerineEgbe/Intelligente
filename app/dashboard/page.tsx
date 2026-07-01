import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, MessageSquare, Bell, ChevronRight, Flag } from 'lucide-react'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Student'
  const firstName = userName.split(' ')[0]

  const [
    { data: traitProfile },
    { data: recommendations },
    { data: roadmap },
    { data: recentSessions },
  ] = await Promise.all([
    supabase.from('trait_profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('recommendations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('roadmaps').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('conversation_sessions').select('id, status, started_at').eq('user_id', user.id).order('started_at', { ascending: false }).limit(3),
  ])

  const hasProfile = !!traitProfile
  const topStrength = (traitProfile?.top_strengths as string[])?.[0] ?? null
  const profileType = traitProfile?.profile_type as string | null ?? null
  const primaryRec = (recommendations as any)?.career_matches?.find((m: any) => m.is_primary) ?? (recommendations as any)?.career_matches?.[0] ?? null
  const degreeRec = (recommendations as any)?.degree_field ?? null
  const fitVerdict = (primaryRec?.fit_verdict as string) ?? null
  const pathway = (roadmap as any)?.pathway ?? null

  const profileTypeLabels: Record<string, string> = {
    explorer: 'The Explorer',
    pathfinder: 'The Pathfinder',
    visionary: 'The Visionary',
    builder: 'The Builder',
  }
  const profileLabel = profileType ? (profileTypeLabels[profileType] ?? profileType) : null

  const fitStyles: Record<string, string> = {
    strong: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    conditional: 'text-amber-600 bg-amber-50 border-amber-200',
    misaligned: 'text-red-600 bg-red-50 border-red-200',
  }
  const fitLabels: Record<string, string> = {
    strong: 'Strong Fit',
    conditional: 'Conditional Fit',
    misaligned: 'Misaligned',
  }

  const defaultSteps = [
    { name: 'HND', field: primaryRec?.career_name ?? degreeRec ?? 'Your Field', duration: '2 Years' },
    { name: 'Top-Up BTech', field: primaryRec?.career_name ?? degreeRec ?? 'Your Field', duration: '1 Year' },
    { name: 'BTech', field: primaryRec?.career_name ?? degreeRec ?? 'Your Field', duration: 'Final Year' },
  ]
  const steps = pathway?.qualifications ?? defaultSteps

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0c1f4a]">Welcome back, {firstName} 👋</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Let&apos;s continue building your future.</p>
        </div>
        <button className="relative p-2 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] transition-colors mt-1">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">2</span>
        </button>
      </div>

      {!hasProfile ? (
        /* No profile yet */
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#dbeafe] flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-[#1a3461]" />
          </div>
          <h2 className="text-lg font-bold text-[#0c1f4a] mb-2">Start Your Discovery</h2>
          <p className="text-[#64748b] text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Have a conversation with Intelligente and we&apos;ll build your personalised career and degree recommendations.
          </p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0c1f4a] text-white rounded-xl font-semibold text-sm hover:bg-[#1a3461] transition-colors">
            Start Conversation <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          {/* Journey pathway */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-[#0c1f4a]">Your Journey</h2>
              <div className="flex items-center gap-2">
                {fitVerdict && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${fitStyles[fitVerdict] ?? 'text-[#64748b] bg-[#f1f5f9] border-[#e2e8f0]'}`}>
                    {fitLabels[fitVerdict] ?? fitVerdict}
                  </span>
                )}
                {primaryRec?.match_score && (
                  <span className="text-xs font-semibold text-[#2563eb]">{primaryRec.match_score}% Confidence</span>
                )}
              </div>
            </div>
            {primaryRec?.career_name && <p className="text-[#64748b] text-sm mb-4">{primaryRec.career_name}</p>}

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {steps.map((q: any, i: number) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="rounded-xl px-4 py-3 min-w-[120px]"
                    style={i === 0 ? { backgroundColor: '#0c1f4a', color: 'white' } : { backgroundColor: '#f1f5f9', color: '#0c1f4a' }}
                  >
                    <p className="text-xs font-semibold opacity-60">{q.name}</p>
                    <p className="text-sm font-bold mt-0.5 leading-tight">{q.field ?? q.name}</p>
                    <p className="text-xs opacity-50 mt-0.5">{q.duration}</p>
                  </div>
                  <ArrowRight size={15} className="text-[#cbd5e1] flex-shrink-0" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
                <Flag size={15} className="text-[#1a3461]" />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Profile Type', value: profileLabel ?? '—', icon: '🧠' },
              { label: 'Top Strength', value: topStrength ?? '—', icon: '⚡' },
              { label: 'Current Focus', value: 'Prepare for Admission', icon: '🎯' },
              { label: 'Progress', value: '45% Complete', icon: '📈', pct: 45 },
            ].map(({ label, value, icon, pct }) => (
              <div key={label} className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">{icon}</span>
                  <p className="text-xs text-[#94a3b8] font-medium">{label}</p>
                </div>
                <p className="text-sm font-bold text-[#0c1f4a] leading-tight">{value}</p>
                {pct !== undefined && (
                  <div className="h-1 rounded-full bg-[#f1f5f9] mt-2">
                    <div className="h-1 rounded-full bg-[#0c1f4a]" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Continue conversation + reminders */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0c1f4a] mb-1">Continue Conversation</h3>
              <p className="text-xs text-[#94a3b8] mb-4 leading-relaxed">
                {recentSessions && recentSessions.length > 0
                  ? 'Last message: Tell me more about the kind of problems you enjoy solving.'
                  : 'Start a new discovery conversation with Intelligente.'}
              </p>
              <Link href="/chat" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3461] transition-colors">
                {recentSessions && recentSessions.length > 0 ? 'Continue Chat' : 'Start Chat'}
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0c1f4a]">Upcoming Reminders</h3>
                <Link href="/dashboard/roadmap" className="text-xs text-[#2563eb] hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {[
                  { text: 'Submit admission documents', sub: 'Due in 5 days', icon: '📄' },
                  { text: 'Pay acceptance fee', sub: 'Due in 12 days', icon: '💳' },
                ].map(({ text, sub, icon }) => (
                  <div key={text} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors cursor-pointer">
                    <span className="text-base">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0c1f4a] truncate">{text}</p>
                      <p className="text-xs text-[#94a3b8]">{sub}</p>
                    </div>
                    <ChevronRight size={13} className="text-[#cbd5e1] flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent conversations */}
          {recentSessions && recentSessions.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0c1f4a]">Recent Conversations</h3>
                <Link href="/dashboard/my-conversations" className="text-xs text-[#2563eb] hover:underline">View all</Link>
              </div>
              <div className="space-y-2">
                {recentSessions.map((s) => (
                  <Link key={s.id} href={`/dashboard/my-conversations/${s.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={13} className="text-[#1a3461]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0c1f4a]">Discovery Session</p>
                      <p className="text-xs text-[#94a3b8]">{new Date(s.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    {s.status === 'completed' && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Completed</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/dashboard/profile', label: 'My Profile', icon: '🧬', desc: 'View your traits' },
              { href: '/dashboard/career-recommendation', label: 'Career Match', icon: '💼', desc: 'See top careers' },
              { href: '/dashboard/degree-recommendation', label: 'Degree Match', icon: '🎓', desc: 'View programmes' },
              { href: '/dashboard/roadmap', label: 'Roadmap', icon: '🗺️', desc: 'Your action plan' },
            ].map(({ href, label, icon, desc }) => (
              <Link key={href} href={href} className="bg-white rounded-xl border border-[#e2e8f0] p-4 hover:border-[#0c1f4a]/20 hover:shadow-md transition-all group">
                <span className="text-2xl mb-2 block">{icon}</span>
                <p className="text-sm font-bold text-[#0c1f4a] group-hover:text-[#1a3461]">{label}</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
