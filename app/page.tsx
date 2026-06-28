'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BrainCircuit,
  Sparkles,
  Bell,
  MousePointerClick,
  ChevronDown,
  ArrowRight,
  GraduationCap,
  Target,
  Compass,
  Menu,
  X,
  LayoutDashboard,
  MessageCircle,
  User,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const faqs = [
  {
    q: 'How does AI help me find the right program?',
    a: 'Intelligente analyses your interests, goals, and academic profile to match you with programs that align with your career aspirations at LMUI.',
  },
  {
    q: 'Do I need a detailed profile to get started?',
    a: 'No. You can begin a conversation immediately and build your profile as you go. The more context you share, the more personalised the guidance.',
  },
  {
    q: 'Is the platform free for students?',
    a: 'Yes. Intelligente is provided free of charge to all prospective and enrolled students of Landmark Metropolitan University Institute.',
  },
  {
    q: 'Can I apply for programs directly through the platform?',
    a: 'Intelligente guides you toward the right program and connects you with the LMUI admissions process, making your application journey seamless.',
  },
  {
    q: 'How does the career alert system work?',
    a: 'Once your profile is set up, Intelligente notifies you of new academic pathways, career opportunities, and scholarship matches relevant to your goals.',
  },
]

export default function LandingPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; initial: string } | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const accountDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) {
        const name = u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'Student'
        setUser({ name, email: u.email ?? '', initial: name.charAt(0).toUpperCase() })
      }
      setAuthChecked(true)
    })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    if (accountOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [accountOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setAccountOpen(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white text-[#0c1f4a] font-sans">
      {/* Announcement bar */}
      <div className="bg-[#0c1f4a] text-white text-center text-xs py-2 px-4">
        Intelligente v1.0 is now live. AI-powered guidance for LMUI students.
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-[#0c1f4a]">Intelligente</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#64748b]">
            <Link href="/how-it-works" className="hover:text-[#0c1f4a] transition-colors">How It Works</Link>
            <Link href="/features" className="hover:text-[#0c1f4a] transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-[#0c1f4a] transition-colors">Pricing</Link>
          </nav>

          {/* Desktop buttons / account */}
          <div className="hidden md:flex items-center gap-3">
            {authChecked && (
              user ? (
                /* Logged-in: account dropdown */
                <div className="relative" ref={accountDropdownRef}>
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e2e8f0] text-sm text-[#0c1f4a] font-medium hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0c1f4a] flex items-center justify-center text-white text-xs font-semibold">
                      {user.initial}
                    </div>
                    {user.name.split(' ')[0]}
                    <ChevronDown size={14} className={`text-[#94a3b8] transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-11 z-50 w-56 bg-white rounded-xl shadow-xl border border-[#e2e8f0] overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#f1f5f9]">
                          <p className="text-sm font-semibold text-[#0c1f4a] truncate">{user.name}</p>
                          <p className="text-xs text-[#94a3b8] truncate">{user.email}</p>
                        </div>
                        <div className="py-1.5">
                          <Link href="/dashboard" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                            <LayoutDashboard size={14} className="text-[#64748b]" />
                            Dashboard
                          </Link>
                          <Link href="/dashboard/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                            <User size={14} className="text-[#64748b]" />
                            My Profile
                          </Link>
                          <Link href="/chat" onClick={() => setAccountOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                            <MessageCircle size={14} className="text-[#64748b]" />
                            New Conversation
                          </Link>
                        </div>
                        <div className="border-t border-[#f1f5f9] py-1.5">
                          <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={14} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged-out: login + get started */
                <>
                  <Link href="/login" className="text-sm text-[#0c1f4a] hover:text-[#1a3461] font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-[#0c1f4a] text-white hover:bg-[#1a3461] font-medium transition-colors">
                    Get Started
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#0c1f4a] hover:bg-[#f1f5f9] transition-colors"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle menu"
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-[#e2e8f0] bg-white px-5 py-4 space-y-1">
            {[
              { href: '/how-it-works', label: 'How It Works' },
              { href: '/features', label: 'Features' },
              { href: '/pricing', label: 'Pricing' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-3 rounded-lg text-sm text-[#64748b] hover:text-[#0c1f4a] hover:bg-[#f8fafc] transition-colors"
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-[#e2e8f0] pt-3 mt-3">
              {authChecked && (
                user ? (
                  /* Logged-in mobile actions */
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {user.initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0c1f4a] truncate">{user.name}</p>
                        <p className="text-xs text-[#94a3b8] truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/dashboard" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                      <LayoutDashboard size={14} className="text-[#64748b]" />
                      Dashboard
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                      <User size={14} className="text-[#64748b]" />
                      My Profile
                    </Link>
                    <Link href="/chat" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors">
                      <MessageCircle size={14} className="text-[#64748b]" />
                      New Conversation
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileNavOpen(false) }} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  /* Logged-out mobile: login + register */
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setMobileNavOpen(false)} className="flex items-center justify-center px-4 py-2.5 rounded-lg border border-[#e2e8f0] text-sm text-[#0c1f4a] font-medium hover:bg-[#f8fafc] transition-colors">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setMobileNavOpen(false)} className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#0c1f4a] text-sm text-white font-medium hover:bg-[#1a3461] transition-colors">
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient blob */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[#0c1f4a]/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-16 md:pt-24 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-[#0c1f4a]/20 text-[#1a3461] mb-6 md:mb-8">
            <Sparkles size={12} />
            AI-Powered Academic Guidance
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#0c1f4a] mb-5 md:mb-6">
            Stop guessing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a3461] to-[#3b82f6]">
              what to study.
            </span>
          </h1>

          <p className="text-lg text-[#64748b] max-w-xl mx-auto mb-3">
            Have a real conversation. Discover the degree and career that actually fit who you are, not just your grades.
          </p>
          <p className="text-sm text-[#94a3b8] mb-10">Currently guiding A-Level students toward LMUI.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0c1f4a] text-white font-medium hover:bg-[#1a3461] transition-colors"
            >
              Start the Conversation
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#e2e8f0] text-[#0c1f4a] font-medium hover:bg-[#f8fafc] transition-colors"
            >
              Login
            </Link>
          </div>
          <p className="text-xs text-[#94a3b8] mt-3">No credit card. No test. Just talk.</p>

          {/* Floating job cards */}
          <div className="relative mt-16 h-56 hidden md:block">
            <div className="absolute left-[8%] top-4 bg-white rounded-xl shadow-lg border border-[#e2e8f0] px-4 py-3 text-left w-52">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#dbeafe] flex items-center justify-center">
                  <GraduationCap size={12} className="text-[#1a3461]" />
                </div>
                <span className="text-xs font-semibold text-[#0c1f4a]">BSc Computer Science</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">Tech</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">Full-time</span>
              </div>
            </div>
            <div className="absolute left-[38%] top-0 bg-white rounded-xl shadow-lg border border-[#e2e8f0] px-4 py-3 text-left w-52">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#dbeafe] flex items-center justify-center">
                  <Target size={12} className="text-[#1a3461]" />
                </div>
                <span className="text-xs font-semibold text-[#0c1f4a]">MBA: Business</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#1a3461]">Match 94%</span>
              </div>
            </div>
            <div className="absolute right-[8%] top-6 bg-white rounded-xl shadow-lg border border-[#e2e8f0] px-4 py-3 text-left w-56">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#dbeafe] flex items-center justify-center">
                  <Compass size={12} className="text-[#1a3461]" />
                </div>
                <span className="text-xs font-semibold text-[#0c1f4a]">MSc Data Science</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">Research</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">Full-time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-[#e2e8f0] bg-[#f8fafc] py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8] mb-6">
            Trusted by leading institutions
          </p>
          <div className="flex flex-wrap justify-center gap-10 items-center opacity-40 grayscale">
            {['LMUI', 'Accreditation Board', 'Career Hub', 'Alumni Network', 'Industry Partners'].map((name) => (
              <span key={name} className="text-sm font-semibold text-[#0c1f4a]">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-[#0c1f4a]/20 text-[#1a3461] mb-4">
              <Sparkles size={12} />
              Features
            </div>
            <h2 className="text-4xl font-bold text-[#0c1f4a] mb-4">
              All the Tools You Need to Succeed
            </h2>
            <p className="text-[#64748b] max-w-md mx-auto">
              Empowering you with intelligent features to simplify your academic journey and connect with the right opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: BrainCircuit,
                title: 'AI-Powered Matching',
                desc: 'Match with the best academic opportunities using AI designed to connect you with programs that fit your skills and goals.',
                bg: 'bg-[#dbeafe]',
                color: 'text-[#1a3461]',
              },
              {
                icon: Bell,
                title: 'Program Alerts in Real Time',
                desc: 'Stay ahead with instant notifications for new programs, scholarships, and pathways that match your profile.',
                bg: 'bg-[#dbeafe]',
                color: 'text-[#1a3461]',
              },
              {
                icon: MousePointerClick,
                title: 'One-Click Applications',
                desc: 'Explore your ideal programs instantly and get connected to the application process with minimal friction.',
                bg: 'bg-[#dbeafe]',
                color: 'text-[#1a3461]',
              },
              {
                icon: Sparkles,
                title: 'Intelligent Recommendations',
                desc: 'Get personalised program recommendations based on your skills, experience, interests, and career preferences.',
                bg: 'bg-[#dbeafe]',
                color: 'text-[#1a3461]',
              },
            ].map(({ icon: Icon, title, desc, bg, color }) => (
              <div key={title} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-semibold text-[#0c1f4a] mb-2">{title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-[#0c1f4a]/20 text-[#1a3461] mb-4">
                <Sparkles size={12} />
                FAQ
              </div>
              <h2 className="text-4xl font-bold text-[#0c1f4a] mb-4">
                Everything You Need to Know
              </h2>
              <p className="text-[#64748b] mb-8">
                Still have a question? Reach our support team.
              </p>
              <Link
                href="/pricing#faq"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#0c1f4a] text-[#0c1f4a] text-sm font-medium hover:bg-[#0c1f4a] hover:text-white transition-colors"
              >
                Contact us
              </Link>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-[#0c1f4a] hover:bg-[#f8fafc] transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {faq.q}
                    <ChevronDown
                      size={16}
                      className={`text-[#94a3b8] transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-[#64748b] leading-relaxed border-t border-[#e2e8f0] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-[#0c1f4a] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <BrainCircuit size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-[#93c5fd] mb-8">
            Join students already using Intelligente to discover their ideal academic and career path.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#0c1f4a] font-semibold hover:bg-[#f1f5f9] transition-colors"
          >
            Start the Conversation
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0a1628] text-[#64748b] text-center py-6 text-xs">
        © {new Date().getFullYear()} Intelligente · Landmark Metropolitan University Institute
      </footer>
    </div>
  )
}
