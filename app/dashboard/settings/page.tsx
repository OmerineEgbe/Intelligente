'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUserName(user.user_metadata?.full_name ?? '')
      setUserEmail(user.email ?? '')
    })
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { full_name: userName } })
    setMessage(error ? error.message : 'Settings saved.')
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Settings</h1>
      <p className="text-[#64748b] text-sm mb-8">Manage your account details and preferences.</p>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-4">
        <h2 className="text-sm font-semibold text-[#0c1f4a] mb-4 flex items-center gap-2">
          <User size={15} /> Account Details
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1.5">Full Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0c1f4a] focus:outline-none focus:ring-2 focus:ring-[#1a3461]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1.5">
              <Mail size={12} className="inline mr-1" /> Email Address
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] text-sm text-[#94a3b8] cursor-not-allowed"
            />
            <p className="text-xs text-[#94a3b8] mt-1">Email cannot be changed here.</p>
          </div>
          {message && (
            <p className="text-sm text-green-600">{message}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] disabled:opacity-60 transition-colors"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h2 className="text-sm font-semibold text-[#0c1f4a] mb-4 flex items-center gap-2">
          <Lock size={15} /> Privacy & Account
        </h2>
        <p className="text-sm text-[#64748b] mb-4 leading-relaxed">
          Your conversations, trait profile, and recommendations are private. No one, including administrators, can access your personal data.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0c1f4a] transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
