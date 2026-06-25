'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'
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
} from 'lucide-react'

const faqs = [
  {
    q: 'How does AI help me find the right program?',
    a: 'Intelligente analyses your interests, goals, and academic profile to match you with programs that align with your career aspirations at LMUI.',
  },
  {
    q: 'Do I need a detailed profile to get started?',
    a: 'No — you can begin a conversation immediately and build your profile as you go. The more context you share, the more personalised the guidance.',
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
  const session = useSession()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (session?.data?.user) {
      router.push('/dashboard')
    }
  }, [session?.data?.user, router])

  return (
    <div className="min-h-screen bg-white text-[#0c1f4a] font-sans">
      {/* Announcement bar */}
      <div className="bg-[#0c1f4a] text-white text-center text-xs py-2 px-4">
        Intelligente v1.0 is now live — AI-powered guidance for LMUI students
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-[#0c1f4a]">Intelligente</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#64748b]">
            <a href="#features" className="hover:text-[#0c1f4a] transition-colors">Features</a>
            <a href="#faq" className="hover:text-[#0c1f4a] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-[#0c1f4a] hover:text-[#1a3461] font-medium transition-colors">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm px-4 py-2 rounded-lg bg-[#0c1f4a] text-white hover:bg-[#1a3461] font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient blob */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[#0c1f4a]/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-[#0c1f4a]/20 text-[#1a3461] mb-8">
            <Sparkles size={12} />
            AI-Powered Academic Guidance
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-[#0c1f4a] mb-6">
            Find Your Path with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a3461] to-[#3b82f6]">
              AI Precision
            </span>
          </h1>

          <p className="text-lg text-[#64748b] max-w-xl mx-auto mb-10">
            Intelligente scans your interests, goals, and strengths to match you with the ideal degree program and career path at Landmark Metropolitan University Institute.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0c1f4a] text-white font-medium hover:bg-[#1a3461] transition-colors"
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#e2e8f0] text-[#0c1f4a] font-medium hover:bg-[#f8fafc] transition-colors"
            >
              Sign In
            </Link>
          </div>

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
                <span className="text-xs font-semibold text-[#0c1f4a]">MBA — Business</span>
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
                href="/sign-up"
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
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#0c1f4a] font-semibold hover:bg-[#f1f5f9] transition-colors"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0a1628] text-[#64748b] text-center py-6 text-xs">
        © {new Date().getFullYear()} Intelligente — Landmark Metropolitan University Institute
      </footer>
    </div>
  )
}
