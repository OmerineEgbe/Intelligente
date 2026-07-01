import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  Bell,
  CheckCircle,
  TrendingUp,
  DollarSign,
  BarChart2,
} from 'lucide-react'

interface CareerMatch {
  career_name: string
  match_score: number
  fit_verdict: string
  why_matched: string[]
  demand: string
  growth_outlook: string
  typical_salary: string
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
            Continue Conversation <ArrowRight size={14} />
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
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl border border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] transition-colors">
            <Bell size={16} />
          </button>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1f4a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3461] transition-colors"
          >
            Explore All Careers <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Primary career card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                <CheckCircle size={11} /> Best Match
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dbeafe] text-[#0c1f4a] text-xs font-bold">
                {primary.match_score}% Match
              </span>
            </div>

            {/* Career identity */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-[#f0f4ff] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                💼
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0c1f4a] leading-tight">{primary.career_name}</h2>
                <p className="text-sm text-[#64748b] mt-0.5">
                  {primary.fit_verdict === 'strong_fit'
                    ? 'Highly aligned with your strengths and goals.'
                    : 'A great fit based on your profile.'}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-1 text-[#94a3b8] mb-1">
                  <BarChart2 size={12} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Demand</span>
                </div>
                <p className="text-sm font-semibold text-[#0c1f4a]">{primary.demand || 'High'}</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-1 text-[#94a3b8] mb-1">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Growth Outlook</span>
                </div>
                <p className="text-sm font-semibold text-[#0c1f4a]">{primary.growth_outlook || 'Strong'}</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <div className="flex items-center gap-1 text-[#94a3b8] mb-1">
                  <DollarSign size={12} />
                  <span className="text-[10px] font-medium uppercase tracking-wide">Typical Salary (Entry)</span>
                </div>
                <p className="text-sm font-semibold text-[#0c1f4a]">{primary.typical_salary || 'Competitive'}</p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#dbeafe] text-[#0c1f4a] rounded-xl text-sm font-semibold hover:bg-blue-200 transition-colors"
            >
              View Career Details <ArrowRight size={14} />
            </Link>
          </div>

          {/* Other matches */}
          {others.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0c1f4a] mb-3">Other Great Matches</h3>
              <div className="space-y-2">
                {others.map((career, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer group border border-transparent hover:border-[#e2e8f0]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">💼</span>
                      <span className="text-sm font-semibold text-[#0c1f4a]">{career.career_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#1a3461] bg-[#dbeafe] px-2 py-0.5 rounded-full">
                        {career.match_score}%
                      </span>
                      <ArrowRight size={14} className="text-[#94a3b8] group-hover:text-[#0c1f4a] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel — 1/3 */}
        <div className="space-y-5">
          {/* Why this career fits */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Why This Career Fits You</h3>
            <ul className="space-y-3">
              {(primary.why_matched ?? []).slice(0, 3).map((reason, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#64748b] leading-snug">{reason}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a3461] hover:text-[#0c1f4a] mt-4 transition-colors"
            >
              View Full Explanation <ArrowRight size={11} />
            </Link>
          </div>

          {/* Career Insight */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Career Insight</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl">
                <div className="w-8 h-8 bg-[#dbeafe] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase size={14} className="text-[#0c1f4a]" />
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8]">Job Opportunities</p>
                  <p className="text-sm font-bold text-[#0c1f4a]">10K+</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl">
                <div className="w-8 h-8 bg-[#dbeafe] rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={14} className="text-[#0c1f4a]" />
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8]">Industries</p>
                  <p className="text-sm font-bold text-[#0c1f4a]">15+</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-xl">
                <div className="w-8 h-8 bg-[#dbeafe] rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={14} className="text-[#0c1f4a]" />
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8]">Growth Rate</p>
                  <p className="text-sm font-bold text-[#0c1f4a]">22%</p>
                </div>
              </div>
            </div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a3461] hover:text-[#0c1f4a] mt-4 transition-colors"
            >
              Explore Career Path <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
