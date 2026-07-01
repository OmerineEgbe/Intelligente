import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, ArrowRight } from 'lucide-react'
import TraitRadarChart from '@/components/profile/TraitRadarChart'

const PROFILE_TYPE_MAP: Record<string, {
  letter: string
  label: string
  desc: string
}> = {
  explorer: {
    letter: 'E',
    label: 'The Explorer',
    desc: 'You are open and curious, discovering who you are through exploration. You thrive when given space to try different things before committing.',
  },
  pathfinder: {
    letter: 'P',
    label: 'The Pathfinder',
    desc: 'You have some sense of where you\'re headed and are seeking clarity. You\'re building on a foundation of emerging direction.',
  },
  visionary: {
    letter: 'V',
    label: 'The Visionary',
    desc: 'You have a clear sense of where you\'re going. You are building conviction and looking for the clearest path to your goal.',
  },
  builder: {
    letter: 'B',
    label: 'The Builder',
    desc: 'You are results-driven and love turning ideas into reality. You thrive in structured environments where you can create and execute.',
  },
}

const TRAIT_RADAR_LABELS: Record<string, string> = {
  analytical_thinking: 'Analytical',
  creativity: 'Creativity',
  leadership: 'Leadership',
  empathy: 'Empathy',
  structure_preference: 'Structure',
  independence: 'Independence',
  resilience: 'Resilience',
  communication: 'Communication',
}

const STRENGTH_DESCRIPTIONS: Record<string, string> = {
  'Analytical Thinking': 'You break down complex problems with precision and clarity.',
  'Creativity': 'You generate original ideas and think beyond conventional boundaries.',
  'Leadership': 'You inspire and guide others towards shared goals.',
  'Empathy': 'You connect deeply with others and understand their perspectives.',
  'Structure Preference': 'You excel in organized, process-driven environments.',
  'Independence': 'You thrive when given autonomy and self-direction.',
  'Resilience': 'You bounce back from setbacks and stay focused under pressure.',
  'Communication': 'You express ideas clearly and connect with audiences.',
}

const STRENGTH_EMOJIS: Record<string, string> = {
  'Analytical Thinking': '🧠',
  'Creativity': '🎨',
  'Leadership': '🌟',
  'Empathy': '💙',
  'Structure Preference': '📋',
  'Independence': '🦅',
  'Resilience': '💪',
  'Communication': '🗣️',
}

const WORK_ENVS = [
  { icon: '🕐', label: 'Flexible Schedule' },
  { icon: '🤝', label: 'Collaborative Teams' },
  { icon: '💡', label: 'Innovative Environment' },
  { icon: '💻', label: 'Technology Driven' },
]

function deriveMotivationTags(
  ambition: string | null,
  strengths: string[]
): string[] {
  const tags: string[] = []
  if (ambition) {
    const lower = ambition.toLowerCase()
    if (lower.includes('build') || lower.includes('creat')) tags.push('Building & creating')
    if (lower.includes('help') || lower.includes('people')) tags.push('Helping others')
    if (lower.includes('money') || lower.includes('financ') || lower.includes('wealth')) tags.push('Financial freedom')
    if (lower.includes('learn') || lower.includes('know') || lower.includes('study')) tags.push('Learning new things')
    if (lower.includes('lead') || lower.includes('manage')) tags.push('Leading & influencing')
    if (lower.includes('tech') || lower.includes('code') || lower.includes('software')) tags.push('Technology & innovation')
  }
  if (tags.length < 3) {
    const strengthMap: Record<string, string> = {
      'Leadership': 'Leading & influencing',
      'Empathy': 'Helping others',
      'Creativity': 'Building & creating',
      'Analytical Thinking': 'Learning new things',
      'Communication': 'Connecting with people',
      'Resilience': 'Overcoming challenges',
    }
    for (const s of strengths) {
      const mapped = strengthMap[s]
      if (mapped && !tags.includes(mapped)) tags.push(mapped)
      if (tags.length >= 4) break
    }
  }
  if (tags.length === 0) {
    return ['Learning new things', 'Building & creating', 'Financial freedom', 'Helping others']
  }
  return tags.slice(0, 4)
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

  const { data: allProfiles } = await supabase
    .from('trait_profiles')
    .select('id, profile_type, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!traitProfile) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0c1f4a]">My Discovery Profile</h1>
            <p className="text-[#64748b] text-sm mt-0.5">Complete a conversation to generate your profile.</p>
          </div>
          <button className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] transition-colors">
            <Bell size={20} />
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-10 text-center">
          <p className="text-[#94a3b8] mb-5">No profile generated yet.</p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] transition-colors"
          >
            Start a Conversation <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const typeInfo = PROFILE_TYPE_MAP[traitProfile.profile_type] ?? {
    letter: (traitProfile.profile_type?.[0] ?? '?').toUpperCase(),
    label: traitProfile.profile_type ?? 'Unknown',
    desc: '',
  }
  const traits = (traitProfile.trait_scores ?? {}) as Record<string, { score: number; justification: string }>
  const topStrengths = (traitProfile.top_strengths ?? []) as string[]
  const generatedDate = new Date(traitProfile.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const radarData = [
    'analytical_thinking', 'creativity', 'leadership', 'empathy',
    'structure_preference', 'independence', 'resilience', 'communication',
  ].map((key) => ({
    trait: TRAIT_RADAR_LABELS[key],
    score: traits[key]?.score ?? 0,
  }))

  const topThree = topStrengths.slice(0, 3)
  const motivationTags = deriveMotivationTags(traitProfile.stated_ambition, topStrengths)

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#0c1f4a]">My Discovery Profile</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Generated on {generatedDate}</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] transition-colors">
          <Bell size={20} />
        </button>
      </div>

      {/* Row 1: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Discovery Type */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 flex flex-col items-center text-center">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-4">Your Discovery Type</p>
          <div className="w-20 h-20 rounded-full bg-[#0c1f4a] flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl font-bold text-white">{typeInfo.letter}</span>
          </div>
          <h2 className="text-lg font-bold text-[#0c1f4a] mb-1">{typeInfo.label}</h2>
          <p className="text-[#64748b] text-sm leading-relaxed mb-4">{typeInfo.desc}</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbeafe] text-[#1a3461] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0c1f4a] inline-block" />
            92% Confidence
          </span>
        </div>

        {/* Trait Radar */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">Your Trait Scores</p>
          <TraitRadarChart data={radarData} />
        </div>

        {/* Top Strengths */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 flex flex-col">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-4">Top Strengths</p>
          <div className="space-y-4 flex-1">
            {topThree.length > 0 ? topThree.map((strength, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">{STRENGTH_EMOJIS[strength] ?? '⭐'}</span>
                <div>
                  <p className="text-sm font-semibold text-[#0c1f4a]">{strength}</p>
                  <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">
                    {STRENGTH_DESCRIPTIONS[strength] ?? 'A core strength that defines how you engage with the world.'}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-[#94a3b8]">No strengths data yet.</p>
            )}
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0c1f4a] hover:underline mt-4"
          >
            View all strengths <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Row 2: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* What Motivates You */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-4">What Motivates You</p>
          <div className="flex flex-wrap gap-2">
            {motivationTags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#1a3461] text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          {traitProfile.stated_ambition && (
            <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wide mb-1">Stated Ambition</p>
              <p className="text-sm text-[#0c1f4a] leading-relaxed">{traitProfile.stated_ambition}</p>
            </div>
          )}
        </div>

        {/* Ideal Work Environment */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-4">Ideal Work Environment</p>
          <div className="grid grid-cols-2 gap-4">
            {WORK_ENVS.map((env) => (
              <div key={env.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="text-2xl">{env.icon}</span>
                <span className="text-sm font-medium text-[#0c1f4a]">{env.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Profile Evolution */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Profile Evolution</p>
          <Link href="#" className="inline-flex items-center gap-1 text-xs font-medium text-[#0c1f4a] hover:underline">
            View full history <ArrowRight size={12} />
          </Link>
        </div>
        {allProfiles && allProfiles.length > 0 ? (
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {allProfiles.map((p, i) => {
              const info = PROFILE_TYPE_MAP[p.profile_type] ?? {
                letter: (p.profile_type?.[0] ?? '?').toUpperCase(),
                label: p.profile_type ?? 'Unknown',
              }
              const date = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              const isLast = i === allProfiles.length - 1
              return (
                <div key={p.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow ${isLast ? 'bg-[#0c1f4a] text-white' : 'bg-[#dbeafe] text-[#1a3461]'}`}>
                      {info.letter}
                    </div>
                    <p className="text-xs font-semibold text-[#0c1f4a] mt-1.5">{info.label}</p>
                    <p className="text-[10px] text-[#94a3b8]">{date}</p>
                  </div>
                  {!isLast && (
                    <div className="w-16 h-px bg-[#e2e8f0] mx-2 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-[#94a3b8]">No evolution history yet.</p>
        )}
      </div>
    </div>
  )
}
