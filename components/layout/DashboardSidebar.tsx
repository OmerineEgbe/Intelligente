'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BrainCircuit,
  Home,
  User,
  GraduationCap,
  Briefcase,
  Map,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  MessageCircle,
  LayoutDashboard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/degree-recommendation', icon: GraduationCap, label: 'Degree Recommendation' },
  { href: '/dashboard/career-recommendation', icon: Briefcase, label: 'Career Recommendation' },
  { href: '/dashboard/roadmap', icon: Map, label: 'Roadmap' },
  { href: '/dashboard/my-conversations', icon: MessageSquare, label: 'My Conversations' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface DashboardSidebarProps {
  userName: string
  userEmail: string
}

export function DashboardSidebar({ userName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    if (avatarOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen])

  // Auto-close drawers on route change
  useEffect(() => {
    setMobileOpen(false)
    setAvatarOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initial = userName.charAt(0).toUpperCase()

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-base">Intelligente</span>
        </Link>
        <button
          className="lg:hidden text-white/50 hover:text-white transition-colors p-1"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-white/50'} />
              {label}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-white/10">
          <Link
            href="/chat"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
          >
            <MessageSquare size={16} />
            Start New Conversation
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-white/40 text-xs truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar — only on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0c1f4a] flex items-center justify-between px-4 border-b border-white/10">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/70 hover:text-white transition-colors p-1"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-white" />
          <span className="font-bold text-white text-sm">Intelligente</span>
        </Link>

        {/* Avatar with dropdown */}
        <div className="relative" ref={avatarDropdownRef}>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-semibold transition-colors"
            aria-label="Account menu"
          >
            {initial}
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-10 z-50 w-52 bg-white rounded-xl shadow-xl border border-[#e2e8f0] overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-[#f1f5f9]">
                  <p className="text-sm font-semibold text-[#0c1f4a] truncate">{userName}</p>
                  <p className="text-xs text-[#94a3b8] truncate">{userEmail}</p>
                </div>

                {/* Actions */}
                <div className="py-1.5">
                  <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                    <LayoutDashboard size={14} className="text-[#64748b]" />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                    <User size={14} className="text-[#64748b]" />
                    My Profile
                  </Link>
                  <Link href="/chat" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                    <MessageCircle size={14} className="text-[#64748b]" />
                    New Conversation
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                    <Settings size={14} className="text-[#64748b]" />
                    Settings
                  </Link>
                </div>

                {/* Sign out */}
                <div className="border-t border-[#f1f5f9] py-1.5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>

      {/* Overlay backdrop — mobile only */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full z-50
          w-72 lg:w-64 flex-shrink-0 bg-[#0c1f4a] flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
