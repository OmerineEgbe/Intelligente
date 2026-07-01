'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

interface MonthlyPoint { month: string; students: number }
interface CareerPoint { name: string; count: number; pct: number }

const CAREER_COLORS = ['#0c1f4a', '#1a3461', '#2952a3', '#3b82f6', '#60a5fa', '#93c5fd']

export function DashboardCharts({
  monthlyGrowth,
  topCareers,
}: {
  monthlyGrowth: MonthlyPoint[]
  topCareers: CareerPoint[]
}) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Student Growth */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0c1f4a]">Student Growth</h3>
            {monthlyGrowth.length > 0 && (
              <p className="text-xs text-[#94a3b8] mt-0.5">
                {monthlyGrowth[monthlyGrowth.length - 1]?.month} · {monthlyGrowth[monthlyGrowth.length - 1]?.students.toLocaleString()} students
              </p>
            )}
          </div>
          <span className="text-xs font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1 rounded-lg">This Year</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyGrowth} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
              labelStyle={{ color: '#0c1f4a', fontWeight: 600 }}
            />
            <Line type="monotone" dataKey="students" stroke="#0c1f4a" strokeWidth={2.5} dot={{ r: 3, fill: '#0c1f4a' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Career Interests */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0c1f4a]">Top Career Interests</h3>
          <span className="text-xs font-medium text-[#64748b] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1 rounded-lg">View all</span>
        </div>
        {topCareers.length > 0 ? (
          <div className="space-y-3">
            {topCareers.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-[#64748b] w-28 truncate flex-shrink-0">{c.name}</span>
                <div className="flex-1 bg-[#f1f5f9] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${c.pct}%`, backgroundColor: CAREER_COLORS[i % CAREER_COLORS.length] }}
                  />
                </div>
                <span className="text-xs font-semibold text-[#0c1f4a] w-8 text-right flex-shrink-0">{c.pct}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-[#94a3b8]">No recommendation data yet</div>
        )}
      </div>
    </div>
  )
}
