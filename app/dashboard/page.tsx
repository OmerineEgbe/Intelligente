import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, MessageSquare, ChevronRight, Flag, Zap } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Student'
  const firstName = userName.split(' ')[0]

  const admin = createAdminClient()

  const [
    { data: traitProfile },
    { data: recommendations },
    { data: roadmap },
    { data: recentSessions },
  ] = await Promise.all([
    supabase.from('trait_profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('recommendations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('roadmaps').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('conversation_sessions').select('id, status, started_at').eq('user_id', user.id).order('started_at', { ascending: false }).limit(3),
  ])

  // Fetch last conversation message for "continue conversation" card
  const { data: lastMsgRow } = await admin
    .from('conversation_messages')
    .select('message, sender, session_id, conversation_sessions!inner(user_id)')
    .eq('conversation_sessions.user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hasProfile = !!traitProfile
  const topStrength = (traitProfile?.top_strengths as string[])?.[0] ?? null
  const profileType = traitProfile?.profile_type as string | null ?? null
  const primaryRec = (recommendations as any)?.career_matches?.find((m: any) => m.is_primary) ?? (recommendations as any)?.career_matches?.[0] ?? null
  const degreeRec = (recommendations as any)?.degree_field ?? null
  const fitVerdict = (primaryRec?.fit_verdict as string) ?? null
  const pathway = (roadmap as any)?.pathway ?? null
  const immediateActions = (pathway?.immediate_actions as any[]) ?? []

  // Derive primary institution from saved institution_matches (same field names as roadmap page)
  const institutionMatches = (recommendations as any)?.institution_matches as any[] | null
  const primaryInstitution = institutionMatches?.find((m: any) => m.available) ?? null
  const institutionLabel = primaryInstitution
    ? `${primaryInstitution.university_short ?? primaryInstitution.university_name ?? primaryInstitution.short_name} Pathway`
    : null

  // Compute real progress percentage
  const progressPct = [
    hasProfile,
    !!recommendations,
    !!roadmap,
    (recentSessions?.length ?? 0) > 0,
  ].filter(Boolean).length * 25

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
    strong_fit: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    conditional_fit: 'text-amber-600 bg-amber-50 border-amber-200',
  }
  const fitLabels: Record<string, string> = {
    strong: 'Strong Fit',
    conditional: 'Conditional Fit',
    misaligned: 'Misaligned',
    strong_fit: 'Strong Fit',
    conditional_fit: 'Conditional Fit',
  }

  const degreeField = degreeRec ?? primaryRec?.career_name ?? 'Your Field'
  const qualificationSteps = pathway?.qualifications ?? [
    { name: 'HND', field: degreeField, duration: '2 Years' },
    { name: 'Top-Up BTech', field: degreeField, duration: '1 Year' },
    { name: 'BTech', field: degreeField, duration: 'Final Year' },
  ]

  const mostRecentSession = recentSessions?.[0] ?? null
  const lastSessionId = mostRecentSession?.id ?? null

  // Last message preview (strip sentinel tokens)
  const lastMsgText = lastMsgRow?.sender === 'assistant'
    ? (lastMsgRow.message ?? '').replace(/<<PROFILE_READY>>/g, '').trim().slice(0, 100)
    : null

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0c1f4a]">Welcome back, {firstName} 👋</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Let&apos;s continue building your future.</p>
        </div>
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
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0c1f4a]">Your Journey</h2>
                {institutionLabel && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#1a3461] border border-[#bfdbfe]">
                    {institutionLabel}
                  </span>
                )}
              </div>
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
              {qualificationSteps.map((q: any, i: number) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="rounded-xl px-4 py-3 min-w-[120px]"
                    style={i === 0 ? { backgroundColor: '#0c1f4a', color: 'white' } : { backgroundColor: '#f1f5f9', color: '#0c1f4a' }}
                  >
                    <p className="text-xs font-semibold opacity-60">{q.name}</p>
                    <p className="text-sm font-bold mt-0.5 leading-tight">{q.field ?? degreeField}</p>
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
              { label: 'Career Match', value: primaryRec?.career_name ?? '—', icon: '🎯' },
              { label: 'Progress', value: `${progressPct}% Complete`, icon: '📈', pct: progressPct },
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

          {/* Continue conversation + immediate actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0c1f4a] mb-1">Continue Conversation</h3>
              <p className="text-xs text-[#94a3b8] mb-4 leading-relaxed line-clamp-2">
                {lastMsgText
                  ? lastMsgText + (lastMsgText.length === 100 ? '…' : '')
                  : 'Start a new discovery conversation with Intelligente.'}
              </p>
              <Link
                href={lastSessionId ? `/chat?session_id=${lastSessionId}` : '/chat'}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3461] transition-colors"
              >
                {lastSessionId ? 'Continue Chat' : 'Start Chat'}
              </Link>
            </div>

            {/* Immediate actions from roadmap — no hardcoded data */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#0c1f4a]">Next Actions</h3>
                <Link href="/dashboard/roadmap" className="text-xs text-[#2563eb] hover:underline">View roadmap</Link>
              </div>
              {immediateActions.length > 0 ? (
                <div className="space-y-2">
                  {immediateActions.slice(0, 2).map((action: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc]">
                      <Zap size={14} className="text-[#2563eb] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0c1f4a] truncate">{action.title}</p>
                        {action.description && (
                          <p className="text-xs text-[#94a3b8] mt-0.5 line-clamp-1">{action.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Your immediate action items will appear here once your roadmap is generated.
                </p>
              )}
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
                  <Link key={s.id} href={`/chat?session_id=${s.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={13} className="text-[#1a3461]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0c1f4a]">Discovery Session</p>
                      <p className="text-xs text-[#94a3b8]">{new Date(s.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.status === 'completed' && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Completed</span>
                      )}
                      <ChevronRight size={13} className="text-[#cbd5e1]" />
                    </div>
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
