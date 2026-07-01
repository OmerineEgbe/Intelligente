'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, Trophy, Zap, CheckCircle2, Clock } from 'lucide-react'

const PROGRESS_BARS = [
  { label: 'Profile Completion', value: 100, color: '#0c1f4a' },
  { label: 'Career Discovery', value: 80, color: '#1a3461' },
  { label: 'Degree Exploration', value: 70, color: '#2563eb' },
  { label: 'Roadmap Actions', value: 40, color: '#3b82f6' },
  { label: 'Applications', value: 20, color: '#93c5fd' },
]

const ACHIEVEMENTS = [
  { icon: '🏆', title: 'Profile Pioneer', date: 'Completed your first discovery profile' },
  { icon: '🎯', title: 'Career Explorer', date: 'Explored your first career match' },
  { icon: '🗺️', title: 'Roadmap Ready', date: 'Generated your academic roadmap' },
]

const MILESTONES = [
  { label: 'Discovery', status: 'completed' },
  { label: 'Career Match', status: 'completed' },
  { label: 'Roadmap Created', status: 'upcoming' },
  { label: 'Application Started', status: 'in-progress' },
  { label: 'Admitted', status: 'future' },
  { label: 'Graduation', status: 'future' },
]

function DonutProgress({ percent }: { percent: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="#0c1f4a"
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#0c1f4a]">{percent}%</span>
        <span className="text-[10px] text-[#94a3b8] font-medium">Keep going!</span>
      </div>
    </div>
  )
}

export default function MyProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-[#f1f5f9] rounded animate-pulse mb-3" />
        <div className="h-4 w-72 bg-[#f1f5f9] rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#0c1f4a]">My Progress</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Track your journey and celebrate your growth.</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] transition-colors">
          <Bell size={20} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex flex-col items-center text-center">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">Overall Progress</p>
          <DonutProgress percent={45} />
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center mb-3">
            <CheckCircle2 size={20} className="text-[#0c1f4a]" />
          </div>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">Actions Completed</p>
          <p className="text-3xl font-bold text-[#0c1f4a]">18</p>
          <p className="text-sm text-[#94a3b8]">/ 40</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center mb-3">
            <Trophy size={20} className="text-[#0c1f4a]" />
          </div>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">Milestones Achieved</p>
          <p className="text-3xl font-bold text-[#0c1f4a]">3</p>
          <p className="text-sm text-[#94a3b8]">/ 10</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center mb-3">
            <Zap size={20} className="text-[#0c1f4a]" />
          </div>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">Streak</p>
          <p className="text-3xl font-bold text-[#0c1f4a]">12</p>
          <p className="text-sm text-[#94a3b8]">Days</p>
        </div>
      </div>

      {/* Progress overview + Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        {/* Progress bars — wider */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-5">Progress Overview</p>
          <div className="space-y-5">
            {PROGRESS_BARS.map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#0c1f4a]">{bar.label}</span>
                  <span className="text-sm font-semibold text-[#0c1f4a]">{bar.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#f1f5f9]">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] p-6">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-5">Recent Achievements</p>
          <div className="space-y-4">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.title} className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="text-2xl leading-none flex-shrink-0">{a.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#0c1f4a]">{a.title}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Journey */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-6">Milestone Journey</p>
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
          {MILESTONES.map((m, i) => {
            const isLast = i === MILESTONES.length - 1
            const statusStyles: Record<string, { dot: string; label: string; badge: string }> = {
              completed: { dot: 'bg-[#0c1f4a]', label: 'text-[#0c1f4a]', badge: 'bg-[#dbeafe] text-[#1a3461]' },
              'in-progress': { dot: 'bg-[#3b82f6]', label: 'text-[#1a3461]', badge: 'bg-blue-50 text-blue-600' },
              upcoming: { dot: 'bg-[#e2e8f0] border-2 border-[#94a3b8]', label: 'text-[#64748b]', badge: 'bg-[#f1f5f9] text-[#94a3b8]' },
              future: { dot: 'bg-[#f1f5f9] border-2 border-[#e2e8f0]', label: 'text-[#94a3b8]', badge: 'bg-[#f8fafc] text-[#cbd5e1]' },
            }
            const s = statusStyles[m.status] ?? statusStyles.future
            const badgeLabel = {
              completed: 'Completed',
              'in-progress': 'In Progress',
              upcoming: 'Uncompleted',
              future: m.label === 'Graduation' ? 'Future Goal' : 'Upcoming',
            }[m.status]
            return (
              <div key={m.label} className="flex items-start flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.dot}`}>
                    {m.status === 'completed' && <CheckCircle2 size={18} className="text-white" />}
                    {m.status === 'in-progress' && <Clock size={18} className="text-white" />}
                  </div>
                  <p className={`text-xs font-semibold mt-2 text-center max-w-[80px] ${s.label}`}>{m.label}</p>
                  <span className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.badge}`}>{badgeLabel}</span>
                </div>
                {!isLast && (
                  <div className="w-16 h-px bg-[#e2e8f0] mt-5 mx-1 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
