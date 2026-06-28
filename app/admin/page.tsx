'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Plus } from 'lucide-react'
import { useState } from 'react'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'schools' | 'programmes' | 'careers'>('schools')

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#e2e8f0] bg-white sticky top-0">
        <div>
          <h1 className="text-xl font-bold text-[#0c1f4a]">Intelligente Admin</h1>
          <p className="text-xs text-[#64748b]">Manage academic programmes and career paths</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-sm px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#0c1f4a] hover:bg-[#f8fafc] transition-colors">
            Dashboard
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-[#64748b] hover:bg-[#f8fafc] transition-colors">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex gap-1 mb-8 border-b border-[#e2e8f0]">
          {(['schools', 'programmes', 'careers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm capitalize transition-colors ${
                activeTab === tab ? 'text-[#0c1f4a] border-b-2 border-[#0c1f4a]' : 'text-[#94a3b8] hover:text-[#0c1f4a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0c1f4a] capitalize">{activeTab}</h2>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors">
              <Plus size={16} /> Add
            </button>
          </div>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-8 text-center text-sm text-[#94a3b8]">
            Admin content for {activeTab} will appear here.
          </div>
        </div>
      </div>
    </div>
  )
}
