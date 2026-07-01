import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { Bell, Building2, BookOpen, Settings, Shield, ChevronRight } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'AI model updated successfully.',
    description: 'Claude Sonnet 4.6 is now active.',
    category: 'System',
    timestamp: '2026-06-28 11:45 PM',
    read: true,
    icon: 'system',
  },
  {
    id: '2',
    title: 'High Demand Alert',
    description: 'Medicine is the most requested career not yet offered by LMUI.',
    category: 'Analytics',
    timestamp: '2026-06-28 04:20 PM',
    read: true,
    icon: 'analytics',
  },
  {
    id: '3',
    title: 'Backup Completed',
    description: 'Daily database backup completed successfully.',
    category: 'System',
    timestamp: '2026-06-28 02:10 AM',
    read: true,
    icon: 'system',
  },
]

const CATEGORY_STYLES: Record<string, string> = {
  Universities: 'bg-blue-50 text-blue-700',
  Programmes: 'bg-purple-50 text-purple-700',
  System: 'bg-[#f8fafc] text-[#64748b]',
  Security: 'bg-red-50 text-red-700',
  Analytics: 'bg-orange-50 text-orange-700',
  'AI Engine': 'bg-green-50 text-green-700',
}

function NotifIcon({ type }: { type: string }) {
  const base = 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0'
  if (type === 'universities') return <div className={`${base} bg-blue-50`}><Building2 size={18} className="text-blue-600" /></div>
  if (type === 'programmes') return <div className={`${base} bg-purple-50`}><BookOpen size={18} className="text-purple-600" /></div>
  if (type === 'security') return <div className={`${base} bg-red-50`}><Shield size={18} className="text-red-600" /></div>
  return <div className={`${base} bg-[#f0f4ff]`}><Settings size={18} className="text-[#0c1f4a]" /></div>
}

export default async function NotificationsPage() {
  await requirePermission('admin:access')

  const tabs = ['All', 'System', 'Universities', 'Programmes', 'Security']

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Notifications" subtitle="System notifications and alerts." />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#e2e8f0] mb-5">
            {tabs.map((t, i) => (
              <button
                key={t}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  i === 0 ? 'text-[#0c1f4a] border-[#0c1f4a]' : 'text-[#94a3b8] border-transparent hover:text-[#0c1f4a]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] divide-y divide-[#f1f5f9]">
            {MOCK_NOTIFICATIONS.map(n => (
              <div key={n.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors">
                <NotifIcon type={n.icon} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0c1f4a]">{n.title}</p>
                      <p className="text-xs text-[#64748b] mt-0.5">{n.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_STYLES[n.category] ?? 'bg-[#f8fafc] text-[#64748b]'}`}>
                        {n.category}
                      </span>
                      <span className="text-[10px] text-[#94a3b8] whitespace-nowrap">{n.timestamp}</span>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
                <button className="text-[#94a3b8] hover:text-[#0c1f4a] transition-colors flex-shrink-0 mt-1">
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-[#94a3b8]">Showing 1 to {MOCK_NOTIFICATIONS.length} of {MOCK_NOTIFICATIONS.length} notifications</p>
            <button className="text-xs font-medium text-[#0c1f4a] hover:underline">Mark all as read</button>
          </div>
        </div>
      </div>
    </div>
  )
}
