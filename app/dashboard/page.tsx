import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, GraduationCap, Briefcase, Map, ArrowRight, Sparkles, User } from 'lucide-react'

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Student'
  const firstName = userName.split(' ')[0]

  // Fetch latest trait profile
  const { data: traitProfile } = await supabase
    .from('trait_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch latest recommendation
  const { data: recommendation } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_alternative', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch latest roadmap
  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch recent conversations
  const { data: recentSessions } = await supabase
    .from('conversation_sessions')
    .select('id, started_at, ended_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(3)

  const hasProfile = !!traitProfile
  const profileTypeLabels: Record<string, string> = {
    explorer: 'Explorer',
    pathfinder: 'Pathfinder',
    visionary: 'Visionary',
  }
  const profileDescriptions: Record<string, string> = {
    explorer: 'Open and curious. You are discovering who you are through exploration.',
    pathfinder: 'Direction-aware. You have some sense of where you\'re headed and are seeking clarity.',
    visionary: 'Purpose-driven. You have a clear direction and are building conviction.',
  }

  let topDegree = ''
  let topCareer = ''
  let immediateActions: any[] = []

  if (recommendation?.explanation) {
    try {
      const exp = typeof recommendation.explanation === 'string'
        ? JSON.parse(recommendation.explanation)
        : recommendation.explanation
      topDegree = exp.programme_name ?? ''
      topCareer = exp.career_name ?? ''
    } catch {}
  }

  if (roadmap?.immediate_actions) {
    immediateActions = Array.isArray(roadmap.immediate_actions) ? roadmap.immediate_actions.slice(0, 2) : []
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-[#64748b] text-sm">
          {hasProfile
            ? 'Your guidance profile is ready. Explore your results below.'
            : 'Start a conversation to discover your ideal degree and career path.'}
        </p>
      </div>

      {!hasProfile ? (
        /* No profile yet - CTA */
        <div className="bg-[#0c1f4a] rounded-2xl p-8 text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ready to discover your path?</h2>
          <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
            Have a real conversation with Intelligente. It takes 8–12 minutes and gives you a personalised profile, degree match, and roadmap.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0c1f4a] rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            Start the Conversation
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Discovery Profile Card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-[#64748b]" />
              <span className="text-xs text-[#64748b] font-medium uppercase tracking-wide">Discovery Profile</span>
            </div>
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#dbeafe] text-[#1a3461] text-xs font-semibold">
                {profileTypeLabels[traitProfile.profile_type] ?? traitProfile.profile_type}
              </span>
            </div>
            <p className="text-sm text-[#64748b] leading-relaxed">
              {profileDescriptions[traitProfile.profile_type] ?? ''}
            </p>
            <Link href="/dashboard/profile" className="mt-3 inline-flex items-center gap-1 text-xs text-[#1a3461] font-medium hover:underline">
              View full profile <ArrowRight size={12} />
            </Link>
          </div>

          {/* Degree Match */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap size={16} className="text-[#64748b]" />
              <span className="text-xs text-[#64748b] font-medium uppercase tracking-wide">Top Degree Match</span>
            </div>
            {topDegree ? (
              <>
                <p className="font-semibold text-[#0c1f4a] text-sm mb-1">{topDegree}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${recommendation?.fit_verdict === 'strong_fit' ? 'bg-green-50 text-green-700' : recommendation?.fit_verdict === 'conditional_fit' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                  {recommendation?.fit_verdict?.replace('_', ' ')}
                </span>
              </>
            ) : (
              <p className="text-sm text-[#94a3b8]">No degree match yet</p>
            )}
            <Link href="/dashboard/degree-recommendation" className="mt-3 inline-flex items-center gap-1 text-xs text-[#1a3461] font-medium hover:underline">
              View details <ArrowRight size={12} />
            </Link>
          </div>

          {/* Career Match */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={16} className="text-[#64748b]" />
              <span className="text-xs text-[#64748b] font-medium uppercase tracking-wide">Top Career Match</span>
            </div>
            {topCareer ? (
              <p className="font-semibold text-[#0c1f4a] text-sm mb-1">{topCareer}</p>
            ) : (
              <p className="text-sm text-[#94a3b8]">No career match yet</p>
            )}
            <Link href="/dashboard/career-recommendation" className="mt-3 inline-flex items-center gap-1 text-xs text-[#1a3461] font-medium hover:underline">
              View details <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Roadmap preview */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Map size={16} className="text-[#64748b]" />
              <span className="text-sm font-semibold text-[#0c1f4a]">Roadmap</span>
            </div>
            <Link href="/dashboard/roadmap" className="text-xs text-[#1a3461] hover:underline">View all</Link>
          </div>
          {immediateActions.length > 0 ? (
            <ul className="space-y-2">
              {immediateActions.map((action: any, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#dbeafe] flex items-center justify-center text-[10px] font-bold text-[#1a3461] flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-[#0c1f4a]">{action.action}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#94a3b8]">Complete a conversation to generate your roadmap.</p>
          )}
        </div>

        {/* Recent conversations */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#64748b]" />
              <span className="text-sm font-semibold text-[#0c1f4a]">Recent Conversations</span>
            </div>
            <Link href="/dashboard/my-conversations" className="text-xs text-[#1a3461] hover:underline">View all</Link>
          </div>
          {recentSessions && recentSessions.length > 0 ? (
            <ul className="space-y-2">
              {recentSessions.map((session: any) => (
                <li key={session.id} className="flex items-center justify-between text-sm py-1.5 border-b border-[#f1f5f9] last:border-0">
                  <span className="text-[#0c1f4a] truncate">Discovery Session</span>
                  <span className="text-[#94a3b8] text-xs flex-shrink-0 ml-2">
                    {new Date(session.started_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[#94a3b8] mb-3">No conversations yet.</p>
              <Link href="/chat" className="inline-flex items-center gap-1.5 text-sm text-[#1a3461] font-medium hover:underline">
                <MessageSquare size={14} />
                Start a conversation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
