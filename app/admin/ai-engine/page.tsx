import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react'

export default async function AIEnginePage() {
  await requirePermission('ai_engine:read')

  const healthChecks = [
    { label: 'API Connection', status: 'Healthy' },
    { label: 'Database', status: 'Healthy' },
    { label: 'Vector Store', status: 'Healthy' },
    { label: 'Cache', status: 'Healthy' },
  ]

  const modelUsage = [
    { model: 'claude-sonnet-4-6', pct: 100 },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="AI Engine" subtitle="Monitor AI model performance and system health." />
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="text-xs font-medium text-[#64748b] mb-3">Engine Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-base font-bold text-green-600">Online</span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">All systems operational</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="text-xs font-medium text-[#64748b] mb-3">Avg Response Time</p>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#0c1f4a]" />
              <span className="text-2xl font-bold text-[#0c1f4a]">1.2 sec</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Excellent</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="text-xs font-medium text-[#64748b] mb-3">Tokens Used Today</p>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[#0c1f4a]" />
              <span className="text-2xl font-bold text-[#0c1f4a]">—</span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">No usage data available</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <p className="text-xs font-medium text-[#64748b] mb-3">Conversation Success</p>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#0c1f4a]" />
              <span className="text-2xl font-bold text-[#0c1f4a]">—</span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1">Calculated from sessions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Model Usage */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">Model Usage</h3>
            <div className="space-y-4">
              {modelUsage.map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-[#64748b]">{m.model}</span>
                    <span className="text-xs font-bold text-[#0c1f4a]">{m.pct}%</span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#0c1f4a]" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">System Health</h3>
            <div className="space-y-3">
              {healthChecks.map((h, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-500" />
                    <span className="text-sm text-[#0c1f4a]">{h.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
          <h3 className="text-sm font-bold text-[#0c1f4a] mb-3">Current Configuration</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-[#f8fafc] rounded-xl p-3">
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Model</p>
              <p className="font-mono text-[#0c1f4a] text-xs">claude-sonnet-4-6</p>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-3">
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Max Tokens</p>
              <p className="font-mono text-[#0c1f4a] text-xs">8,192</p>
            </div>
            <div className="bg-[#f8fafc] rounded-xl p-3">
              <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-1">Temperature</p>
              <p className="font-mono text-[#0c1f4a] text-xs">0.7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
