'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Building2, BookOpen, Briefcase,
  BarChart2, Cpu, Bell, Settings, LogOut, ChevronLeft, BrainCircuit,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/admin/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/students',       label: 'Students',       icon: Users },
  { href: '/admin/universities',   label: 'Universities',   icon: Building2 },
  { href: '/admin/programmes',     label: 'Programmes',     icon: BookOpen },
  { href: '/admin/careers',        label: 'Careers',        icon: Briefcase },
  { href: '/admin/analytics',      label: 'Analytics',      icon: BarChart2 },
  { href: '/admin/ai-engine',      label: 'AI Engine',      icon: Cpu },
  { href: '/admin/notifications',  label: 'Notifications',  icon: Bell },
  { href: '/admin/settings',       label: 'Settings',       icon: Settings },
]

const SIDEBAR_BG = 'linear-gradient(180deg, #05153b 0%, #040f28 100%)'
const ACTIVE_BG = '#0b2968'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [adminName, setAdminName] = useState('Admin')
  const [adminInitials, setAdminInitials] = useState('A')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
        if (data?.full_name) {
          setAdminName(data.full_name)
          const parts = data.full_name.trim().split(' ')
          setAdminInitials(parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2))
        }
      })
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#f0f4f8] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: SIDEBAR_BG }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {!collapsed && (
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <BrainCircuit size={16} className="text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-sm tracking-tight">Intelligente</span>
                <p className="text-white/40 text-[10px]">Admin Panel</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto">
              <BrainCircuit size={16} className="text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`text-white/40 hover:text-white transition-colors ${collapsed ? 'mx-auto mt-3' : 'ml-2'}`}
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? 'text-white font-medium'
                    : 'text-white/55 hover:text-white hover:bg-white/8'
                } ${collapsed ? 'justify-center' : ''}`}
                style={active ? { backgroundColor: ACTIVE_BG } : undefined}
              >
                <Icon size={16} className={`flex-shrink-0 ${active ? 'text-white' : 'text-white/40'}`} />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Admin profile + logout */}
        <div className="border-t border-white/10 p-3 space-y-1">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#0b2968] border border-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{adminInitials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{adminName}</p>
                <p className="text-white/35 text-xs">Super Admin</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-[#0b2968] border border-white/20 flex items-center justify-center">
                <span className="text-white text-sm font-bold">{adminInitials}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-white/45 hover:bg-white/8 hover:text-white transition-all text-sm ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={14} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
