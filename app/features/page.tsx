import Link from 'next/link'
import { BrainCircuit, MessageCircle, Brain, Target, Map, History, LayoutDashboard, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: MessageCircle,
    title: 'Conversational AI intake',
    desc: 'Not a form. Not a quiz. A real, open-ended conversation that goes where you take it, guided by curiosity, not a rigid script.',
  },
  {
    icon: Brain,
    title: 'Trait-based psychological profiling',
    desc: 'We build a picture of you across 8 core dimensions: analytical thinking, creativity, leadership, empathy, and more, drawn from the evidence of the conversation itself.',
  },
  {
    icon: Target,
    title: 'Honest fit verdicts',
    desc: 'Every degree and career match comes with a clear verdict: Strong Fit, Conditional Fit, or Misaligned. With specific reasoning. We never hide uncomfortable truths.',
  },
  {
    icon: Map,
    title: 'LMUI-grounded recommendations',
    desc: 'Degree programmes and career paths are drawn from the real LMUI catalogue, with real entry requirements, qualification pathways, and career outcomes.',
  },
  {
    icon: ArrowRight,
    title: 'Personalised, time-ordered roadmap',
    desc: 'Not a vague suggestion. A concrete action plan for the next 2 weeks, the next term, and across your full qualification pathway.',
  },
  {
    icon: History,
    title: 'Saved conversation history',
    desc: 'Every conversation is saved. Resume where you left off, review your progress, or start a fresh conversation at any time.',
  },
  {
    icon: LayoutDashboard,
    title: 'Full personal dashboard',
    desc: 'Your Discovery Profile, degree and career recommendations, roadmap, and conversation history. All in one place, always accessible.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-[#0c1f4a]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[#e2e8f0]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center">
              <BrainCircuit size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-[#0c1f4a]">Intelligente</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#64748b]">
            <Link href="/how-it-works" className="hover:text-[#0c1f4a]">How It Works</Link>
            <Link href="/features" className="text-[#0c1f4a] font-medium">Features</Link>
            <Link href="/pricing" className="hover:text-[#0c1f4a]">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#0c1f4a] font-medium">Login</Link>
            <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-[#0c1f4a] text-white hover:bg-[#1a3461] font-medium transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0c1f4a] mb-4">Features</h1>
          <p className="text-lg text-[#64748b] max-w-xl mx-auto">
            Everything built around one purpose: giving students genuine clarity about their future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="bg-[#f8fafc] rounded-2xl p-6 border border-[#e2e8f0]">
                <div className="w-10 h-10 rounded-xl bg-[#dbeafe] flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#1a3461]" />
                </div>
                <h3 className="font-semibold text-[#0c1f4a] mb-2">{f.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>

        {/* About section */}
        <div className="bg-[#0c1f4a] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">About Intelligente</h2>
          <p className="text-white/70 leading-relaxed mb-4">
            Intelligente was built because most students choose a degree by guessing, by pressure, or by what sounds impressive rather than by genuine self-understanding. We exist to close that gap.
          </p>
          <p className="text-white/70 leading-relaxed mb-6">
            Today, Intelligente is built for A-Level students in Cameroon preparing to apply to Landmark Metropolitan University Institute (LMUI). Our long-term vision is to extend to more universities, more audiences, and more countries.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0c1f4a] rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
