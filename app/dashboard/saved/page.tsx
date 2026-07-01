import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bell, Briefcase, GraduationCap, BookOpen, MessageSquare, ArrowRight } from 'lucide-react'

const TABS = [
  { key: 'careers', label: 'Careers', icon: Briefcase, emptyLink: '/dashboard/career-recommendation', linkLabel: 'Explore careers' },
  { key: 'degrees', label: 'Degrees', icon: GraduationCap, emptyLink: '/dashboard/degree-recommendation', linkLabel: 'Explore degrees' },
  { key: 'resources', label: 'Resources', icon: BookOpen, emptyLink: '/dashboard/roadmap', linkLabel: 'View roadmap' },
  { key: 'conversations', label: 'Conversations', icon: MessageSquare, emptyLink: '/dashboard/my-conversations', linkLabel: 'View conversations' },
]

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const activeTab = TABS.find((t) => t.key === params.tab) ?? TABS[0]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#0c1f4a]">Saved Items</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Your saved careers, degrees, and resources.</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] transition-colors">
          <Bell size={20} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-[#e2e8f0] mb-6">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab.key
          return (
            <Link
              key={tab.key}
              href={`/dashboard/saved?tab=${tab.key}`}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? 'border-[#0c1f4a] text-[#0c1f4a]'
                  : 'border-transparent text-[#64748b] hover:text-[#0c1f4a] hover:border-[#e2e8f0]'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-14 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mb-4">
          <activeTab.icon size={24} className="text-[#94a3b8]" />
        </div>
        <h2 className="text-base font-semibold text-[#0c1f4a] mb-2">No saved {activeTab.label.toLowerCase()} yet</h2>
        <p className="text-sm text-[#94a3b8] max-w-sm leading-relaxed mb-6">
          Explore and save items from your recommendations. Saved {activeTab.label.toLowerCase()} will appear here for quick access.
        </p>
        <Link
          href={activeTab.emptyLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] transition-colors"
        >
          {activeTab.linkLabel} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
