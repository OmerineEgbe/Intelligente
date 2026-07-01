import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  TrendingUp,
  DollarSign,
  BarChart2,
  Map,
} from 'lucide-react'
import { OtherMatchesList, WhyFitsPanel } from './CareerMatchClient'

interface CareerMatch {
  career_name: string
  match_score: number
  fit_verdict: string
  why_matched: string[]
  demand: string
  growth_outlook: string
  typical_salary: string
  description?: string
  is_primary: boolean
}

export default async function CareerRecommendationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rec } = await supabase
    .from('recommendations')
    .select('career_matches, degree_field, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const matches: CareerMatch[] = rec?.career_matches ?? []
  const primary = matches.find((m) => m.is_primary) ?? matches[0] ?? null
  const others = matches.filter((m) => m !== primary).slice(0, 4)

  if (!primary) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Your Career Recommendation</h1>
        <p className="text-[#64748b] text-sm mb-10">Top careers that match your personality, strengths, and goals.</p>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#dbeafe] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-[#0c1f4a]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0c1f4a] mb-2">No recommendations yet</h2>
          <p className="text-[#94a3b8] text-sm mb-6">
            Complete a conversation with Intelligente to get your personalized career matches.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3461] transition-colors"
          >
            Start a Conversation <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Your Career Recommendation</h1>
          <p className="text-[#64748b] text-sm">Top careers that match your personality, strengths, and goals.</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Primary career card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                <CheckCircle size={11} /> Best Match
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dbeafe] text-[#0c1f4a] text-xs font-bold">
                {primary.match_score}% Match
              </span>
            </div>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-[#f0f4ff] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                💼
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0c1f4a] leading-tight">{primary.career_name}</h2>
                {primary.description ? (
                  <p className="text-sm text-[#64748b] mt-1 leading-relaxed">{primary.description}</p>
                ) : (
                  <p className="text-sm text-[#64748b] mt-0.5">
                    {primary.fit_verdict === 'strong' || primary.fit_verdict === 'strong_fit'
                      ? 'Highly aligned with your strengths and goals.'
                      : 'A great fit based on your profile.'}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-1 text-[#94a3b8] mb-1">
                  <BarChart2 size={12} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Demand</span>
                </div>
                <p className="text-sm font-semibold text-[#0c1f4a]">{primary.demand || '—'}</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-1 text-[#94a3b8] mb-1">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Growth Outlook</span>
                </div>
                <p className="text-sm font-semibold text-[#0c1f4a]">{primary.growth_outlook || '—'}</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-1 text-[#94a3b8] mb-1">
                  <DollarSign size={12} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Entry Salary</span>
                </div>
                <p className="text-sm font-semibold text-[#0c1f4a]">{primary.typical_salary || '—'}</p>
              </div>
            </div>

            {/* Action — link to roadmap, not chat */}
            <Link
              href="/dashboard/roadmap"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#dbeafe] text-[#0c1f4a] rounded-xl text-sm font-semibold hover:bg-blue-200 transition-colors"
            >
              <Map size={14} />
              View My Career Roadmap
            </Link>
          </div>

          {/* Other matches — interactive expansion */}
          {others.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0c1f4a] mb-3">Other Great Matches</h3>
              <OtherMatchesList careers={others} />
            </div>
          )}
        </div>

        {/* Right panel — 1/3 */}
        <div className="space-y-5">
          {/* Why this career fits — interactive show more */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Why This Career Fits You</h3>
            <WhyFitsPanel reasons={primary.why_matched ?? []} />
          </div>

          {/* Career actions panel — real links */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Explore Further</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/roadmap"
                className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl hover:bg-[#f1f5f9] transition-colors group"
              >
                <div className="w-8 h-8 bg-[#dbeafe] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Map size={14} className="text-[#0c1f4a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0c1f4a]">My Roadmap</p>
                  <p className="text-xs text-[#94a3b8]">Step-by-step action plan</p>
                </div>
                <ArrowRight size={13} className="text-[#94a3b8] group-hover:text-[#0c1f4a] transition-colors flex-shrink-0" />
              </Link>
              <Link
                href="/dashboard/degree-recommendation"
                className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl hover:bg-[#f1f5f9] transition-colors group"
              >
                <div className="w-8 h-8 bg-[#dbeafe] rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={14} className="text-[#0c1f4a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0c1f4a]">Degree Match</p>
                  <p className="text-xs text-[#94a3b8]">Universities that offer this path</p>
                </div>
                <ArrowRight size={13} className="text-[#94a3b8] group-hover:text-[#0c1f4a] transition-colors flex-shrink-0" />
              </Link>
              <Link
                href="/chat"
                className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl hover:bg-[#f1f5f9] transition-colors group"
              >
                <div className="w-8 h-8 bg-[#dbeafe] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase size={14} className="text-[#0c1f4a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0c1f4a]">Explore More Careers</p>
                  <p className="text-xs text-[#94a3b8]">Continue the conversation</p>
                </div>
                <ArrowRight size={13} className="text-[#94a3b8] group-hover:text-[#0c1f4a] transition-colors flex-shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
