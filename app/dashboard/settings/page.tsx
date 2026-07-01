'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bell, Camera } from 'lucide-react'

const TABS = ['Account', 'Notifications', 'Privacy', 'Appearance', 'Security'] as const
type Tab = typeof TABS[number]

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('Account')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [language, setLanguage] = useState('English')
  const [timezone, setTimezone] = useState('Africa/Johannesburg')
  const [emailUpdates, setEmailUpdates] = useState(true)
  const [weeklyProgress, setWeeklyProgress] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setFullName(user.user_metadata?.full_name ?? '')
      setEmail(user.email ?? '')
      setPhone(user.user_metadata?.phone ?? '')
    })
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone },
    })
    setMessage(error ? error.message : 'Changes saved successfully.')
    setSaving(false)
  }

  const handleLogoutAll = async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    router.push('/login')
  }

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#0c1f4a]">Settings</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Manage your account and preferences.</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#f1f5f9] text-[#64748b] transition-colors">
          <Bell size={20} />
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex items-center gap-1 border-b border-[#e2e8f0] mb-7">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-[#0c1f4a] text-[#0c1f4a]'
                : 'border-transparent text-[#64748b] hover:text-[#0c1f4a] hover:border-[#e2e8f0]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Account' ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Profile Information */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <h2 className="text-sm font-semibold text-[#0c1f4a] mb-5">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#0c1f4a] flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0c1f4a]">{fullName || 'Your Name'}</p>
                  <button className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#64748b] hover:text-[#0c1f4a] transition-colors">
                    <Camera size={13} /> Change Photo
                  </button>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0c1f4a] placeholder:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1a3461] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] text-sm text-[#94a3b8] cursor-not-allowed"
                  />
                  <p className="text-xs text-[#94a3b8] mt-1">Email address cannot be changed here.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 00 000 0000"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0c1f4a] placeholder:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1a3461] focus:bg-white transition"
                  />
                </div>
                {message && (
                  <p className={`text-sm ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Preferences */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <h2 className="text-sm font-semibold text-[#0c1f4a] mb-5">Preferences</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1.5">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0c1f4a] focus:outline-none focus:ring-2 focus:ring-[#1a3461] transition"
                  >
                    <option>English</option>
                    <option>French</option>
                    <option>Portuguese</option>
                    <option>Swahili</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748b] mb-1.5">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0c1f4a] focus:outline-none focus:ring-2 focus:ring-[#1a3461] transition"
                  >
                    <option value="Africa/Johannesburg">Africa/Johannesburg (UTC+2)</option>
                    <option value="Africa/Lagos">Africa/Lagos (UTC+1)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (UTC+3)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="pt-1 border-t border-[#f1f5f9]">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-4">Notifications</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#0c1f4a]">Email Updates</p>
                        <p className="text-xs text-[#94a3b8]">Receive product news and tips</p>
                      </div>
                      <button
                        onClick={() => setEmailUpdates(!emailUpdates)}
                        className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none ${emailUpdates ? 'bg-[#0c1f4a]' : 'bg-[#e2e8f0]'}`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${emailUpdates ? 'translate-x-5' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#0c1f4a]">Weekly Progress Summary</p>
                        <p className="text-xs text-[#94a3b8]">Get a weekly recap of your journey</p>
                      </div>
                      <button
                        onClick={() => setWeeklyProgress(!weeklyProgress)}
                        className={`relative w-10 h-6 rounded-full transition-colors focus:outline-none ${weeklyProgress ? 'bg-[#0c1f4a]' : 'bg-[#e2e8f0]'}`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${weeklyProgress ? 'translate-x-5' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
            <p className="text-xs text-[#94a3b8] mb-4">Actions here affect all your sessions. Proceed with caution.</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#0c1f4a]">Logout from all devices</p>
                <p className="text-xs text-[#94a3b8]">This will sign you out from every device you're logged in on.</p>
              </div>
              <button
                onClick={handleLogoutAll}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Logout All
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-14 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#f1f5f9] flex items-center justify-center mb-4 text-2xl">🚧</div>
          <h2 className="text-base font-semibold text-[#0c1f4a] mb-1">{activeTab} settings</h2>
          <p className="text-sm text-[#94a3b8]">Coming soon — this section is under development.</p>
        </div>
      )}
    </div>
  )
}
