import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  GraduationCap,
  Bell,
  CheckCircle,
} from 'lucide-react'

interface DegreeMatch {
  programme_name: string
  school_name?: string
  description?: string
  match_score: number
  duration?: string
  entry_requirement?: string
  mode?: string
  fit_verdict: string
  why_matched?: string[]
  is_primary?: boolean
}

export default async function DegreeRecommendationPage() {
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

  // degree_field stores the field name; we build a display from career_matches shape where possible.
  // For the degree page we derive structured degree info from the recommendation row.
  // If a dedicated degree table exists in future, swap this query.
  const careerMatches = (rec?.career_matches ?? []) as any[]
  const degreeField = rec?.degree_field ?? null

  // Build a synthetic primary degree record from what we have
  const hasDegreeData = degreeField !== null || careerMatches.length > 0

  if (!hasDegreeData) {
    return (
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Your Degree Recommendation</h1>
        <p className="text-[#64748b] text-sm mb-10">Based on your profile, interests, and career goals.</p>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#dbeafe] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-[#0c1f4a]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0c1f4a] mb-2">No recommendations yet</h2>
          <p className="text-[#94a3b8] text-sm mb-6">
            Complete a conversation with Intelligente to get your matched LMUI programme.
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

  // Derive primary programme details from available data
  const primary = careerMatches.find((m: any) => m.is_primary) ?? careerMatches[0] ?? null
  const primaryMatchScore = primary?.match_score ?? 85
  const primaryCareerName = primary?.career_name ?? degreeField ?? 'Your Recommended Programme'
  const whyMatched: string[] = primary?.why_matched ?? []
  const others = careerMatches.filter((m: any) => m !== primary).slice(0, 3)

  // Static LMUI degree display values — in production replace with DB degree data
  const programmeName = degreeField
    ? `BTech in ${degreeField}`
    : `BTech in Software Engineering`
  const schoolName = 'School of Engineering & Technology, LMUI'
  const programmeDesc =
    'This programme equips you with the technical foundation and problem-solving skills needed for a career in technology and engineering. Designed around industry needs, it bridges theory with hands-on application.'

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Your Degree Recommendation</h1>
          <p className="text-[#64748b] text-sm">Based on your profile, interests, and career goals.</p>
        </div>
        <button className="w-9 h-9 rounded-xl border border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] transition-colors">
          <Bell size={16} />
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Primary degree card */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                <CheckCircle size={11} /> Best Match
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#dbeafe] text-[#0c1f4a] text-xs font-bold">
                Strong Fit
              </span>
            </div>

            {/* Programme identity */}
            <div className="mb-2">
              <h2 className="text-xl font-bold text-[#0c1f4a] leading-tight mb-0.5">{programmeName}</h2>
              <p className="text-xs text-[#94a3b8] font-medium">{schoolName}</p>
            </div>
            <p className="text-sm text-[#64748b] leading-relaxed mb-5">{programmeDesc}</p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <p className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-wide mb-1">Match Score</p>
                <p className="text-sm font-bold text-[#0c1f4a]">{primaryMatchScore}%</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <p className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm font-bold text-[#0c1f4a]">4 Years</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <p className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-wide mb-1">Entry Requirement</p>
                <p className="text-sm font-bold text-[#0c1f4a]">HND / A-Level</p>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-3">
                <p className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-wide mb-1">Mode</p>
                <p className="text-sm font-bold text-[#0c1f4a]">Full-time</p>
              </div>
            </div>

            {/* View careers link */}
            <Link
              href="/dashboard/career-recommendation"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a3461] hover:text-[#0c1f4a] transition-colors"
            >
              View Careers <ArrowRight size={11} />
            </Link>
          </div>

          {/* Other good matches */}
          {others.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
              <h3 className="text-sm font-bold text-[#0c1f4a] mb-3">Other Good Matches</h3>
              <div className="space-y-2">
                {others.map((m: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer group border border-transparent hover:border-[#e2e8f0]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0c1f4a]">
                        {m.career_name ? `BTech in ${m.career_name}` : `Programme ${i + 2}`}
                      </p>
                      <p className="text-xs text-[#94a3b8]">{schoolName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#1a3461] bg-[#dbeafe] px-2 py-0.5 rounded-full">
                        {m.match_score ?? 75}%
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
          {/* Why this fits */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Why This Fits You</h3>
            <ul className="space-y-3">
              {(whyMatched.length > 0
                ? whyMatched
                : [
                    'Aligned with your analytical strengths',
                    'Matches your interest in technology',
                    'Fits your preferred learning style',
                    'Opens doors to your target career paths',
                  ]
              )
                .slice(0, 4)
                .map((reason: string, i: number) => (
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

          {/* Academic pathway at LMUI */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-5">Your Academic Pathway at LMUI</h3>
            <div className="flex items-stretch gap-0">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-[#0c1f4a] text-white text-center rounded-xl py-2.5 px-2">
                  <p className="text-[11px] font-bold leading-tight">HND</p>
                </div>
                <p className="text-[10px] text-[#94a3b8] mt-1.5 text-center">2 Years</p>
              </div>
              {/* Arrow */}
              <div className="flex items-center px-1 pb-4">
                <div className="w-4 h-0.5 bg-[#e2e8f0]" />
                <div
                  className="w-0 h-0"
                  style={{
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: '6px solid #e2e8f0',
                  }}
                />
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-[#1a3461] text-white text-center rounded-xl py-2.5 px-2">
                  <p className="text-[11px] font-bold leading-tight">Top-Up BTech</p>
                </div>
                <p className="text-[10px] text-[#94a3b8] mt-1.5 text-center">1 Year</p>
              </div>
              {/* Arrow */}
              <div className="flex items-center px-1 pb-4">
                <div className="w-4 h-0.5 bg-[#e2e8f0]" />
                <div
                  className="w-0 h-0"
                  style={{
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: '6px solid #e2e8f0',
                  }}
                />
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-[#dbeafe] text-[#0c1f4a] text-center rounded-xl py-2.5 px-2">
                  <p className="text-[11px] font-bold leading-tight">BTech</p>
                </div>
                <p className="text-[10px] text-[#94a3b8] mt-1.5 text-center">4 Years</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom banner */}
      <div className="mt-6 bg-[#0c1f4a] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white text-sm font-medium text-center sm:text-left">
          Not sure? Continue the conversation to refine your matches even more.
        </p>
        <Link
          href="/chat"
          className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0c1f4a] rounded-xl text-sm font-bold hover:bg-[#f8fafc] transition-colors"
        >
          Continue Conversation <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}
