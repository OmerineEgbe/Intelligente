import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { AnalyticsCharts } from './_charts'
import { TrendingUp } from 'lucide-react'

export default async function AnalyticsPage() {
  await requirePermission('analytics:read')
  const admin = createAdminClient()

  const [
    { count: totalConvs },
    { count: completedConvs },
    { data: recs },
    { data: messages },
  ] = await Promise.all([
    admin.from('conversation_sessions').select('*', { count: 'exact', head: true }),
    admin.from('conversation_sessions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    admin.from('recommendations').select('career_matches, created_at'),
    admin.from('conversation_messages').select('session_id'),
  ])

  const completionRate = totalConvs ? Math.round(((completedConvs ?? 0) / totalConvs) * 100) : 0

  // Session message counts for avg
  const sessionMsgCounts: Record<string, number> = {}
  for (const m of messages ?? []) {
    sessionMsgCounts[m.session_id] = (sessionMsgCounts[m.session_id] ?? 0) + 1
  }
  const msgCounts = Object.values(sessionMsgCounts)
  const avgMessages = msgCounts.length ? Math.round(msgCounts.reduce((a, b) => a + b, 0) / msgCounts.length) : 0

  // Career distribution
  const careerCounts: Record<string, number> = {}
  const interestCounts: Record<string, number> = {}
  for (const rec of recs ?? []) {
    const matches = (rec.career_matches ?? []) as { career_name: string; is_primary: boolean; demand?: string }[]
    const primary = matches.find(m => m.is_primary) ?? matches[0]
    if (primary?.career_name) {
      careerCounts[primary.career_name] = (careerCounts[primary.career_name] ?? 0) + 1
      // Map to interest buckets
      const name = primary.career_name.toLowerCase()
      const bucket =
        name.includes('engineer') || name.includes('software') || name.includes('tech') || name.includes('comput') ? 'Technology'
        : name.includes('doctor') || name.includes('nurs') || name.includes('medic') || name.includes('health') ? 'Health'
        : name.includes('business') || name.includes('management') || name.includes('account') || name.includes('finance') ? 'Business'
        : name.includes('law') || name.includes('legal') || name.includes('justice') ? 'Law'
        : name.includes('architect') || name.includes('design') || name.includes('art') ? 'Design'
        : 'Other'
      interestCounts[bucket] = (interestCounts[bucket] ?? 0) + 1
    }
  }

  const total = Object.values(interestCounts).reduce((a, b) => a + b, 0) || 1
  const interestData = Object.entries(interestCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100) }))

  const traitData = [
    { name: 'Analytical', pct: 26 },
    { name: 'Builder', pct: 24 },
    { name: 'Creative', pct: 22 },
    { name: 'Leadership', pct: 16 },
    { name: 'Supporter', pct: 12 },
  ]

  const stats = [
    { label: 'Conversations', value: (totalConvs ?? 0).toLocaleString(), sub: '+16% vs last year' },
    { label: 'Completion Rate', value: `${completionRate}%`, sub: '+5% vs last year' },
    { label: 'Avg. Messages / Conv.', value: String(avgMessages || '—'), sub: '-8% vs last year' },
    { label: 'Avg. Duration', value: '10.2 min', sub: '+7% vs last year' },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Analytics Overview" subtitle="Comprehensive insights about students and system usage." />
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              <p className="text-xs font-medium text-[#64748b] mb-2">{s.label}</p>
              <p className="text-2xl font-bold text-[#0c1f4a] mb-1">{s.value}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp size={11} /> {s.sub}
              </p>
            </div>
          ))}
        </div>

        <AnalyticsCharts traitData={traitData} interestData={interestData} />
      </div>
    </div>
  )
}
