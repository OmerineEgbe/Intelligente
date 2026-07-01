'use client'

import { Bell, Search, ChevronLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Props {
  title: string
  subtitle: string
  backHref?: string
  backLabel?: string
}

export function AdminHeader({ title, subtitle, backHref, backLabel }: Props) {
  const [initials, setInitials] = useState('A')
  const [name, setName] = useState('Admin')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('full_name').eq('id', user.id).single().then(({ data }) => {
        if (data?.full_name) {
          setName(data.full_name.split(' ')[0])
          const parts = data.full_name.trim().split(' ')
          setInitials(parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2))
        }
      })
    })
  }, [])

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#e2e8f0] flex-shrink-0">
      <div>
        {backHref && (
          <Link href={backHref} className="flex items-center gap-1 text-xs text-[#94a3b8] hover:text-[#0c1f4a] transition-colors mb-1">
            <ChevronLeft size={13} /> {backLabel ?? 'Back'}
          </Link>
        )}
        <h1 className="text-xl font-bold text-[#0c1f4a]">{title}</h1>
        <p className="text-xs text-[#64748b] mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-[#0c1f4a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0c1f4a] w-56 transition-colors"
            placeholder="Search anything..."
          />
        </div>
        <Link href="/admin/notifications" className="relative p-2 rounded-lg hover:bg-[#f8fafc] transition-colors">
          <Bell size={18} className="text-[#64748b]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-[#0c1f4a]">{name}</p>
            <p className="text-[10px] text-[#94a3b8]">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}
