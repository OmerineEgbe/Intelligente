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
  TrendingUp,
  Bookmark,
  LayoutDashboard,
  ChevronLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/degree-recommendation', icon: GraduationCap, label: 'Degree Match' },
  { href: '/dashboard/career-recommendation', icon: Briefcase, label: 'Career Match' },
  { href: '/dashboard/my-conversations', icon: MessageSquare, label: 'Conversation' },
  { href: '/dashboard/roadmap', icon: Map, label: 'Roadmap' },
  { href: '/dashboard/my-progress', icon: TrendingUp, label: 'My Progress' },
  { href: '/dashboard/saved', icon: Bookmark, label: 'Saved' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const SIDEBAR_BG = 'linear-gradient(180deg, #05153b 0%, #040f28 100%)'
const ACTIVE_BG = '#0b2968'

interface DashboardSidebarProps {
  userName: string
  userEmail: string
}

export function DashboardSidebar({ userName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
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

  useEffect(() => {
    setMobileOpen(false)
    setAvatarOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initial = userName.charAt(0).toUpperCase()

  const SidebarContent = ({ isDesktop }: { isDesktop?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {(!isDesktop || !collapsed) && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">Intelligente</span>
          </Link>
        )}
        {isDesktop && collapsed && (
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto">
            <BrainCircuit size={16} className="text-white" />
          </div>
        )}

        {/* Desktop collapse toggle */}
        {isDesktop && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`text-white/40 hover:text-white transition-colors ${collapsed ? 'mx-auto mt-3' : 'ml-2'}`}
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Mobile close */}
        {!isDesktop && (
          <button
            className="text-white/40 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          const isCollapsed = isDesktop && collapsed
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'text-white font-medium'
                  : 'text-white/55 hover:text-white hover:bg-white/8'
              } ${isCollapsed ? 'justify-center' : ''}`}
              style={isActive ? { backgroundColor: ACTIVE_BG } : undefined}
            >
              <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-white/40'}`} />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          )
        })}

        {!(isDesktop && collapsed) && (
          <div className="pt-3 mt-3 border-t border-white/10">
            <Link
              href="/chat"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/8 transition-all font-medium"
            >
              <MessageSquare size={16} className="text-white/50" />
              New Conversation
            </Link>
          </div>
        )}
        {isDesktop && collapsed && (
          <div className="pt-3 mt-3 border-t border-white/10 flex justify-center">
            <Link
              href="/chat"
              title="New Conversation"
              className="flex items-center justify-center p-2.5 rounded-lg text-white/55 hover:text-white hover:bg-white/8 transition-all"
            >
              <MessageSquare size={16} className="text-white/40" />
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-2 py-4 border-t border-white/10 space-y-1">
        {!(isDesktop && collapsed) ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#0b2968] border border-white/20 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <p className="text-white/35 text-xs truncate">Student</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-2">
            <div className="w-8 h-8 rounded-full bg-[#0b2968] border border-white/20 flex items-center justify-center text-white text-sm font-semibold">
              {initial}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={isDesktop && collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-white/45 hover:bg-white/8 hover:text-white transition-all text-sm ${isDesktop && collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={14} className="flex-shrink-0" />
          {!(isDesktop && collapsed) && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 border-b border-white/10"
        style={{ background: '#05153b' }}
      >
        <button onClick={() => setMobileOpen(true)} className="text-white/70 hover:text-white transition-colors p-1">
          <Menu size={22} />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-white" />
          <span className="font-bold text-white text-sm">Intelligente</span>
        </Link>

        <div className="relative" ref={avatarDropdownRef}>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="w-8 h-8 rounded-full bg-[#0b2968] border border-white/20 flex items-center justify-center text-white text-sm font-semibold"
          >
            {initial}
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-10 z-50 w-52 bg-white rounded-xl shadow-xl border border-[#e2e8f0] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#f1f5f9]">
                <p className="text-sm font-semibold text-[#0c1f4a] truncate">{userName}</p>
                <p className="text-xs text-[#94a3b8] truncate">{userEmail}</p>
              </div>
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
              <div className="border-t border-[#f1f5f9] py-1.5">
                <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar (full width, slide in) */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full z-50 w-60 flex-shrink-0 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: SIDEBAR_BG }}
      >
        <SidebarContent isDesktop={false} />
      </aside>

      {/* Desktop sidebar (collapsible) */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}
        style={{ background: SIDEBAR_BG }}
      >
        <SidebarContent isDesktop={true} />
      </aside>
    </>
  )
}
