import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import { AdminHeader } from '../_components/AdminHeader'
import { DashboardCharts } from './_charts'
import { TrendingUp, Users, Building2, MessageSquare, Target } from 'lucide-react'

export default async function AdminDashboardPage() {
  await requirePermission('admin:access')
  const admin = createAdminClient()

  // Parallel data fetching
  const [
    { count: studentCount },
    { data: universities },
    { count: convCount },
    { data: recentStudents },
    { data: recommendations },
    { data: sessions },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    admin.from('universities').select('id, name, short_name, status, institution_type'),
    admin.from('conversation_sessions').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('id, full_name, created_at').eq('role', 'student').order('created_at', { ascending: false }).limit(5),
    admin.from('recommendations').select('career_matches, created_at'),
    admin.from('conversation_sessions').select('started_at').order('started_at', { ascending: true }),
  ])

  const activeUnis = (universities ?? []).filter(u => u.status === 'active').length
  const pendingUnis = (universities ?? []).filter(u => u.status === 'coming_soon').length

  // Career interest aggregation
  const careerCounts: Record<string, number> = {}
  for (const rec of recommendations ?? []) {
    const matches = (rec.career_matches ?? []) as { career_name: string; is_primary: boolean }[]
    const primary = matches.find(m => m.is_primary) ?? matches[0]
    if (primary?.career_name) {
      careerCounts[primary.career_name] = (careerCounts[primary.career_name] ?? 0) + 1
    }
  }
  const topCareers = Object.entries(careerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / Math.max(recommendations?.length ?? 1, 1)) * 100) }))

  // Monthly student growth (last 6 months)
  const now = new Date()
  const monthlyGrowth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      month: d.toLocaleString('en', { month: 'short' }),
      students: 0,
    }
  })
  for (const s of sessions ?? []) {
    const d = new Date(s.started_at)
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (monthsAgo >= 0 && monthsAgo < 6) {
      monthlyGrowth[5 - monthsAgo].students += 1
    }
  }
  // Running cumulative total
  let running = Math.max((studentCount ?? 0) - (sessions?.length ?? 0), 0)
  for (const m of monthlyGrowth) {
    running += m.students
    m.students = running
  }

  // Avg match confidence
  let totalScore = 0, scoreCount = 0
  for (const rec of recommendations ?? []) {
    const matches = (rec.career_matches ?? []) as { match_score?: number; is_primary: boolean }[]
    const primary = matches.find(m => m.is_primary) ?? matches[0]
    if (primary?.match_score) { totalScore += primary.match_score; scoreCount++ }
  }
  const avgConfidence = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Dashboard" subtitle="Welcome back! Here's what's happening with Intelligente." />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Registered Students"
            value={(studentCount ?? 0).toLocaleString()}
            sub="+12% this month"
            positive
            icon={<Users size={18} className="text-[#0c1f4a]" />}
            sparkColor="#3b82f6"
          />
          <StatCard
            label="Universities"
            value={String(activeUnis)}
            sub={`${pendingUnis} Pending`}
            positive
            icon={<Building2 size={18} className="text-[#0c1f4a]" />}
            sparkColor="#10b981"
          />
          <StatCard
            label="Conversations Completed"
            value={(convCount ?? 0).toLocaleString()}
            sub="+15% this month"
            positive
            icon={<MessageSquare size={18} className="text-[#0c1f4a]" />}
            sparkColor="#8b5cf6"
          />
          <StatCard
            label="Avg Match Confidence"
            value={avgConfidence > 0 ? `${avgConfidence}%` : '—'}
            sub="+4% this month"
            positive
            icon={<Target size={18} className="text-[#0c1f4a]" />}
            sparkColor="#f59e0b"
          />
        </div>

        {/* Charts row */}
        <DashboardCharts monthlyGrowth={monthlyGrowth} topCareers={topCareers} />

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-5">
          {/* Top degree demand */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0c1f4a]">Top Career Interest</h3>
              <Link href="/admin/careers" className="text-xs text-[#0c1f4a] font-medium hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {topCareers.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[#0c1f4a] truncate flex-1 mr-4">{c.name}</span>
                  <span className="text-[#64748b] font-medium flex-shrink-0">{c.count}</span>
                </div>
              ))}
              {topCareers.length === 0 && <p className="text-xs text-[#94a3b8]">No data yet</p>}
            </div>
          </div>

          {/* Universities summary */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0c1f4a]">Universities</h3>
              <Link href="/admin/universities" className="text-xs text-[#0c1f4a] font-medium hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {(universities ?? []).slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between">
                  <span className="text-sm text-[#0c1f4a] truncate flex-1 mr-3">{u.short_name}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                    u.status === 'active' ? 'bg-green-50 text-green-700'
                    : u.status === 'coming_soon' ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-[#f8fafc] text-[#94a3b8]'
                  }`}>{u.status === 'coming_soon' ? 'Coming Soon' : u.status}</span>
                </div>
              ))}
              {(universities ?? []).length === 0 && <p className="text-xs text-[#94a3b8]">No universities yet</p>}
            </div>
          </div>

          {/* Recent students */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0c1f4a]">Recent Students</h3>
              <Link href="/admin/students" className="text-xs text-[#0c1f4a] font-medium hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {(recentStudents ?? []).map(s => {
                const parts = (s.full_name ?? '').trim().split(' ')
                const initials = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2)
                return (
                  <div key={s.id} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#0c1f4a]">{initials.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#0c1f4a] truncate">{s.full_name ?? 'Unknown'}</p>
                      <p className="text-[10px] text-[#94a3b8]">{new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                )
              })}
              {(recentStudents ?? []).length === 0 && <p className="text-xs text-[#94a3b8]">No students yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, positive, icon, sparkColor }: {
  label: string; value: string; sub: string; positive: boolean; icon: React.ReactNode; sparkColor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[#64748b]">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-[#f0f4ff] flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-[#0c1f4a] mb-1">{value}</p>
      <p className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>
        <TrendingUp size={11} />
        {sub}
      </p>
    </div>
  )
}
