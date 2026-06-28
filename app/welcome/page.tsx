'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BrainCircuit, ArrowRight, GraduationCap, Target, Compass } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [userName, setUserName] = useState('there')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const name = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'
      setUserName(name)
      setTimeout(() => setVisible(true), 100)
    })
  }, [router])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className={`text-center max-w-lg transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Link href="/" className="flex items-center justify-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-full bg-[#0c1f4a] flex items-center justify-center shadow-lg">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-[#0c1f4a]">Intelligente</span>
        </Link>

        <h1 className="text-4xl font-bold text-[#0c1f4a] mb-4">Welcome, {userName}!</h1>
        <p className="text-[#64748b] text-lg mb-12 leading-relaxed">
          I&apos;m your personal AI academic advisor at LMUI. I&apos;m here to help you find the perfect programme and career path.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
          {[
            { icon: Compass, label: 'Explorer', desc: "I'm not sure yet. Help me discover my interests." },
            { icon: Target, label: 'Pathfinder', desc: 'I have a goal. Help me find the right programme.' },
            { icon: GraduationCap, label: 'Visionary', desc: "I've chosen a programme. Help me confirm it's right." },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
              <div className="w-8 h-8 rounded-lg bg-[#0c1f4a] flex items-center justify-center mb-3">
                <Icon size={16} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-[#0c1f4a] mb-1">{label}</p>
              <p className="text-xs text-[#64748b] leading-snug">{desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/pre-chat')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0c1f4a] text-white font-semibold hover:bg-[#1a3461] transition-colors shadow-md"
        >
          Let&apos;s Get Started
          <ArrowRight size={18} />
        </button>
        <p className="text-xs text-[#94a3b8] mt-6">Takes about 2 minutes to set up your profile</p>
      </div>
    </div>
  )
}
