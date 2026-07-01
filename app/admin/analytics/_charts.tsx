'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const TRAIT_COLORS = ['#0c1f4a', '#1a3461', '#2952a3', '#3b82f6', '#93c5fd']
const INTEREST_COLORS = ['#0c1f4a', '#1a3461', '#2952a3', '#3b82f6', '#60a5fa', '#93c5fd']

interface DataPoint { name: string; pct: number }

export function AnalyticsCharts({ traitData, interestData }: { traitData: DataPoint[]; interestData: DataPoint[] }) {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Trait Distribution */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
        <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Trait Distribution</h3>
        {traitData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={traitData} dataKey="pct" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                  {traitData.map((_, i) => <Cell key={i} fill={TRAIT_COLORS[i % TRAIT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {traitData.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: TRAIT_COLORS[i % TRAIT_COLORS.length] }} />
                    <span className="text-[#64748b]">{t.name}</span>
                  </div>
                  <span className="font-semibold text-[#0c1f4a]">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-[#94a3b8]">No trait data yet</div>
        )}
      </div>

      {/* Interest Distribution */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
        <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Interest Distribution</h3>
        {interestData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={interestData} dataKey="pct" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}>
                  {interestData.map((_, i) => <Cell key={i} fill={INTEREST_COLORS[i % INTEREST_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {interestData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: INTEREST_COLORS[i % INTEREST_COLORS.length] }} />
                    <span className="text-[#64748b]">{d.name}</span>
                  </div>
                  <span className="font-semibold text-[#0c1f4a]">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-sm text-[#94a3b8]">No recommendation data yet</div>
        )}
      </div>
    </div>
  )
}
