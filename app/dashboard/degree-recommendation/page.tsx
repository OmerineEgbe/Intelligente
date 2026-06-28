import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, GraduationCap, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

function FitBadge({ verdict }: { verdict: string }) {
  if (verdict === 'strong_fit') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
      <CheckCircle size={11} /> Strong Fit
    </span>
  )
  if (verdict === 'conditional_fit') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
      <AlertCircle size={11} /> Conditional Fit
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
      <XCircle size={11} /> Misaligned
    </span>
  )
}

export default async function DegreeRecommendationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const parsed = (recommendations ?? []).map((rec) => {
    let exp: any = {}
    try { exp = typeof rec.explanation === 'string' ? JSON.parse(rec.explanation) : rec.explanation } catch {}
    return { ...rec, exp }
  })

  const primary = parsed.find((r) => !r.is_alternative)
  const alternatives = parsed.filter((r) => r.is_alternative)

  if (!primary) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0c1f4a] mb-2">Degree Recommendation</h1>
        <p className="text-[#64748b] mb-8">Your matched LMUI programme will appear here after your conversation.</p>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center">
          <GraduationCap size={36} className="text-[#94a3b8] mx-auto mb-3" />
          <p className="text-[#94a3b8] mb-4">No recommendations yet.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] transition-colors">
            Start a Conversation <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Degree Recommendation</h1>
      <p className="text-[#64748b] text-sm mb-8">Matched to your trait profile. Every recommendation is explained.</p>

      {/* Primary match */}
      <div className="bg-white rounded-2xl border-2 border-[#0c1f4a] p-6 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap size={18} className="text-[#0c1f4a]" />
              <span className="text-xs text-[#64748b] font-medium uppercase tracking-wide">Top Match</span>
            </div>
            <h2 className="text-xl font-bold text-[#0c1f4a]">{primary.exp.programme_name}</h2>
          </div>
          <FitBadge verdict={primary.fit_verdict} />
        </div>

        <p className="text-sm text-[#64748b] leading-relaxed mb-4">{primary.exp.reasoning}</p>

        {primary.exp.qualification_pathway && (
          <div className="bg-[#f8fafc] rounded-xl p-4">
            <p className="text-xs text-[#64748b] font-medium uppercase tracking-wide mb-2">Qualification Pathway</p>
            <p className="text-sm text-[#0c1f4a]">{primary.exp.qualification_pathway}</p>
          </div>
        )}
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wide mb-3">Alternative Options</h3>
          <div className="space-y-3">
            {alternatives.map((alt) => (
              <div key={alt.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-[#0c1f4a]">{alt.exp.programme_name}</h4>
                  <FitBadge verdict={alt.fit_verdict} />
                </div>
                <p className="text-sm text-[#64748b] leading-relaxed">{alt.exp.reasoning}</p>
                {alt.exp.qualification_pathway && (
                  <p className="text-xs text-[#94a3b8] mt-2">{alt.exp.qualification_pathway}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
