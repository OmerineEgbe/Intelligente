import Link from 'next/link'
import { BrainCircuit, MessageCircle, Brain, Target, Map, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: MessageCircle,
    title: 'You talk. We listen.',
    body: 'You have a real conversation, not a form, not a quiz. Intelligente asks open, thoughtful questions about what excites you, what frustrates you, and what kind of future feels right to you. There are no right or wrong answers.',
  },
  {
    icon: Brain,
    title: 'We see the pattern.',
    body: 'As you talk, Intelligente builds a picture of your traits, strengths, working style, and motivations. This is a genuine reflection of who you are, drawn from the evidence of your own words.',
  },
  {
    icon: Target,
    title: 'You get matched. Honestly.',
    body: 'Your trait profile is matched against real LMUI programmes and careers. Every match comes with a clear fit verdict (Strong Fit, Conditional Fit, or Misaligned) and the specific reasoning behind it. If something doesn\'t fit, we tell you what does instead.',
  },
  {
    icon: Map,
    title: 'You get a plan, not just an answer.',
    body: 'Intelligente builds you a time-ordered roadmap: what to do this week, this term, and across your full qualification pathway. Specific, concrete, actionable. Tailored to your matched programme and career.',
  },
]

const results = [
  'Your Discovery Profile: who you are, in plain language.',
  'Career matches that fit you, with the reasons, not just the names.',
  'Degree programmes at LMUI that lead there.',
  'A real roadmap: what to do now, this semester, and beyond.',
  'Honesty, not flattery. If something does not fit, we will tell you what does instead.',
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-[#0c1f4a]">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-[#0c1f4a]">Intelligente</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#64748b]">
            <Link href="/how-it-works" className="text-[#0c1f4a] font-medium">How It Works</Link>
            <Link href="/features" className="hover:text-[#0c1f4a]">Features</Link>
            <Link href="/pricing" className="hover:text-[#0c1f4a]">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#0c1f4a] hover:text-[#1a3461] font-medium">Login</Link>
            <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-[#0c1f4a] text-white hover:bg-[#1a3461] font-medium transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0c1f4a] mb-4">How It Works</h1>
          <p className="text-lg text-[#64748b]">Four steps. One conversation. Complete clarity.</p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-20">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center">
                    <Icon size={18} className="text-[#1a3461]" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Step {i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0c1f4a] mb-2">{step.title}</h3>
                  <p className="text-[#64748b] leading-relaxed">{step.body}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* What you receive */}
        <div className="bg-[#f8fafc] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-[#0c1f4a] mb-6">What You&apos;ll Receive</h2>
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#0c1f4a] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-[10px] font-bold">{i + 1}</span>
                </div>
                <span className="text-[#0c1f4a] text-sm">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center mt-12">
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0c1f4a] text-white rounded-xl font-semibold hover:bg-[#1a3461] transition-colors">
            Start the Conversation <ArrowRight size={16} />
          </Link>
          <p className="text-sm text-[#94a3b8] mt-3">No credit card. No test. Just talk.</p>
        </div>
      </div>
    </div>
  )
}
