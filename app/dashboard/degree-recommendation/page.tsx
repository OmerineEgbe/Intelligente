import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, GraduationCap, Bell, CheckCircle, Building2, Clock, BookOpen, ChevronRight } from 'lucide-react'

export default async function DegreeRecommendationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rec } = await supabase
    .from('recommendations')
    .select('career_matches, degree_field, institution_matches, lmui_match, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const degreeField = rec?.degree_field as string | null
  const careerMatches = (rec?.career_matches ?? []) as any[]
  // institution_matches is the new scalable field; lmui_match is the legacy fallback
  const institutionMatches = (rec?.institution_matches as any[]) ?? (rec?.lmui_match ? [rec.lmui_match] : [])

  const hasDegreeData = degreeField || institutionMatches.length > 0

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
          <p className="text-[#94a3b8] text-sm mb-6">Complete a conversation with Intelligente to get your personalised degree matches.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3461] transition-colors">
            Start a Conversation <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const primaryCareer = careerMatches.find((m: any) => m.is_primary) ?? careerMatches[0] ?? null
  const whyMatched: string[] = primaryCareer?.why_matched ?? []

  // Split institutions: available first, then unavailable
  const available = institutionMatches.filter((m: any) => m.available)
  const unavailable = institutionMatches.filter((m: any) => !m.available)
  const primaryInstitution = available[0] ?? null

  const fitStyles: Record<string, string> = {
    strong: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    conditional: 'text-amber-600 bg-amber-50 border-amber-200',
    misaligned: 'text-red-600 bg-red-50 border-red-200',
    strong_fit: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    conditional_fit: 'text-amber-600 bg-amber-50 border-amber-200',
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0c1f4a]">Your Degree Recommendation</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Based on your profile, interests, and career goals.</p>
        </div>
        <button className="p-2 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] transition-colors">
          <Bell size={18} />
        </button>
      </div>

      {/* Degree field banner */}
      <div className="bg-[#0c1f4a] rounded-2xl p-5 text-white flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Your Degree Field</p>
          <h2 className="text-xl font-bold">{degreeField ?? 'Your Recommended Field'}</h2>
          {primaryCareer && (
            <p className="text-white/60 text-sm mt-1">Leading to: {primaryCareer.career_name}</p>
          )}
        </div>
        <GraduationCap size={40} className="text-white/20 flex-shrink-0" />
      </div>

      {/* Why this fits */}
      {whyMatched.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
          <h3 className="text-sm font-bold text-[#0c1f4a] mb-3">Why This Field Fits You</h3>
          <div className="space-y-2">
            {whyMatched.map((reason: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#374151]">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available institutions */}
      {available.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#0c1f4a] mb-3 flex items-center gap-2">
            <Building2 size={15} className="text-emerald-500" />
            Universities That Offer This Programme
          </h3>
          <div className="space-y-4">
            {available.map((inst: any, i: number) => (
              <div key={i} className={`bg-white rounded-2xl border p-5 ${i === 0 ? 'border-[#0c1f4a]/20 shadow-md' : 'border-[#e2e8f0]'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {i === 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mr-2">Best Match</span>
                    )}
                    <span className="text-xs font-semibold text-[#64748b]">{inst.university_name}</span>
                    <h4 className="text-base font-bold text-[#0c1f4a] mt-1">
                      {inst.qualification} {inst.programme_name}
                    </h4>
                    {inst.school && <p className="text-xs text-[#94a3b8] mt-0.5">{inst.school}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-2xl font-bold text-[#0c1f4a]">{inst.match_score}%</p>
                    <p className="text-[10px] text-[#94a3b8]">Match</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'Duration', value: inst.duration ?? '—', icon: <Clock size={12} /> },
                    { label: 'Entry', value: inst.entry_requirement ?? '—', icon: <BookOpen size={12} /> },
                    { label: 'Mode', value: inst.mode ?? 'Full-time', icon: <GraduationCap size={12} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-[#f8fafc] rounded-xl p-3">
                      <div className="flex items-center gap-1 text-[#94a3b8] mb-1">{icon}<span className="text-[10px]">{label}</span></div>
                      <p className="text-xs font-semibold text-[#0c1f4a] leading-tight">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Why matched */}
                {inst.why_matched?.length > 0 && (
                  <div className="mb-4 space-y-1.5">
                    {inst.why_matched.slice(0, 3).map((r: string, j: number) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#374151]">{r}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Qualification pathway */}
                {inst.pathway?.length > 0 && (
                  <div className="pt-3 border-t border-[#f1f5f9]">
                    <p className="text-[10px] text-[#94a3b8] uppercase tracking-widest mb-2">Academic Pathway</p>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {inst.pathway.map((step: any, j: number, arr: any[]) => (
                        <div key={j} className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="text-center">
                            <div className={`rounded-lg px-3 py-2 ${j === 0 ? 'bg-[#0c1f4a] text-white' : 'bg-[#f1f5f9] text-[#0c1f4a]'}`}>
                              <p className="text-[10px] font-semibold opacity-70">{step.name}</p>
                              <p className="text-xs font-bold">{step.duration}</p>
                            </div>
                          </div>
                          {j < arr.length - 1 && <ChevronRight size={13} className="text-[#cbd5e1] flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unavailable / coming soon institutions */}
      {unavailable.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#94a3b8] mb-3 flex items-center gap-2">
            <Building2 size={15} />
            Other Universities
          </h3>
          <div className="space-y-3">
            {unavailable.map((inst: any, i: number) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#0c1f4a]">{inst.university_name}</span>
                    {inst.closest_alternative?.includes('Coming soon') ? (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Coming Soon</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#94a3b8] bg-white border border-[#e2e8f0] px-2 py-0.5 rounded-full">Not Available</span>
                    )}
                  </div>
                  <p className="text-xs text-[#94a3b8]">
                    {inst.closest_alternative?.includes('Coming soon')
                      ? 'This university will be added to Intelligente soon.'
                      : inst.closest_alternative
                        ? `Closest available: ${inst.closest_alternative}`
                        : `${inst.unmatched_field ?? degreeField} is not currently offered at this institution.`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Continue conversation banner */}
      <div className="bg-[#f1f5f9] rounded-2xl border border-[#e2e8f0] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm text-[#374151]">
          Not sure? Continue the conversation to refine your matches even more.
        </p>
        <Link href="/chat" className="flex-shrink-0 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a3461] transition-colors whitespace-nowrap">
          Continue Conversation
        </Link>
      </div>
    </div>
  )
}
