import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const TRAIT_LABELS: Record<string, string> = {
  analytical_thinking: 'Analytical Thinking',
  creativity: 'Creativity',
  leadership: 'Leadership',
  empathy: 'Empathy',
  structure_preference: 'Structure & Organisation',
  independence: 'Independence',
  resilience: 'Resilience',
  communication: 'Communication',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: traitProfile } = await supabase
    .from('trait_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const profileTypeMap: Record<string, { label: string; desc: string }> = {
    explorer: {
      label: 'Explorer',
      desc: 'You are open and curious, discovering who you are through exploration. You thrive when given space to try different things before committing.',
    },
    pathfinder: {
      label: 'Pathfinder',
      desc: 'You have some sense of where you\'re headed and are seeking clarity. You\'re building on a foundation of emerging direction.',
    },
    visionary: {
      label: 'Visionary',
      desc: 'You have a clear sense of where you\'re going. You are building conviction and looking for the clearest path to your goal.',
    },
  }

  if (!traitProfile) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0c1f4a] mb-2">Your Profile</h1>
        <p className="text-[#64748b] mb-8">Your Discovery Profile will appear here once you complete a conversation.</p>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center">
          <p className="text-[#94a3b8] mb-4">No profile generated yet.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] transition-colors">
            Start a Conversation <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const typeInfo = profileTypeMap[traitProfile.profile_type] ?? { label: traitProfile.profile_type, desc: '' }
  const traits = traitProfile.trait_scores as Record<string, { score: number; justification: string }> ?? {}
  const topStrengths = traitProfile.top_strengths as string[] ?? []
  const sortedTraits = Object.entries(traits).sort((a, b) => b[1].score - a[1].score)

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Your Profile</h1>
      <p className="text-[#64748b] text-sm mb-8">Your Discovery Profile, built from your conversation with Intelligente.</p>

      {/* Profile type */}
      <div className="bg-[#0c1f4a] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-white/15 text-sm font-semibold">{typeInfo.label}</span>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">{typeInfo.desc}</p>
        {traitProfile.stated_ambition && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Stated Ambition</p>
            <p className="text-white text-sm">{traitProfile.stated_ambition}</p>
          </div>
        )}
      </div>

      {/* Top strengths */}
      {topStrengths.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 mb-4">
          <h2 className="text-sm font-semibold text-[#0c1f4a] mb-3">Top Strengths</h2>
          <div className="flex flex-wrap gap-2">
            {topStrengths.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-[#dbeafe] text-[#1a3461] text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trait scores */}
      {sortedTraits.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
          <h2 className="text-sm font-semibold text-[#0c1f4a] mb-4">Trait Breakdown</h2>
          <div className="space-y-4">
            {sortedTraits.map(([key, val]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-[#0c1f4a] font-medium">{TRAIT_LABELS[key] ?? key}</span>
                  <span className="text-sm font-semibold text-[#0c1f4a]">{val.score}</span>
                </div>
                <div className="h-2 rounded-full bg-[#f1f5f9]">
                  <div
                    className="h-2 rounded-full bg-[#0c1f4a] transition-all"
                    style={{ width: `${val.score}%` }}
                  />
                </div>
                {val.justification && (
                  <p className="text-xs text-[#64748b] mt-1">{val.justification}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
