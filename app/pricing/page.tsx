import Link from 'next/link'
import { BrainCircuit, Check, ArrowRight, ChevronDown } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    status: 'Live now',
    price: 'Free',
    cta: 'Start the Conversation →',
    ctaHref: '/register',
    microcopy: 'No credit card required.',
    statusColor: 'bg-green-50 text-green-700',
    featured: true,
    features: [
      'Unlimited conversations',
      'Full Discovery Profile',
      'Career & degree matches',
      'Complete roadmap',
      'Full personal dashboard',
      'Saved conversation history',
    ],
  },
  {
    name: 'Intelligente Pro',
    status: 'Coming Soon',
    price: 'TBA',
    cta: 'Get notified',
    ctaHref: '#',
    statusColor: 'bg-[#f1f5f9] text-[#64748b]',
    featured: false,
    features: [
      'Everything in Free',
      'AI-powered CV builder',
      'Career events & webinars',
      'Networking connections',
      'Employer introductions',
      'Priority support',
    ],
  },
  {
    name: 'For Schools & Institutions',
    status: 'Coming Soon',
    price: 'Contact us',
    cta: 'Get in touch',
    ctaHref: '#',
    statusColor: 'bg-[#f1f5f9] text-[#64748b]',
    featured: false,
    features: [
      'Programme insights & analytics',
      'Admission support tools',
      'Student recruitment collaboration',
      'Dedicated account management',
      'Custom integrations',
    ],
  },
]

const faqs = [
  {
    q: 'Is this only for LMUI?',
    a: 'For the MVP, yes. The career and degree matching is grounded in LMUI\'s real programme catalogue. Intelligente is designed from day one to support additional partner universities. LMUI is our first partner, not our only one.',
  },
  {
    q: 'Is this a personality test?',
    a: 'No. Intelligente is a conversation. There are no right or wrong answers, no scores, and no boxes to tick. The platform draws insight from what you naturally share, not from how you perform on a test.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. The Free tier has no conversation limits, no time limits, and no credit card required. The full platform (profile, recommendations, roadmap) is free.',
  },
  {
    q: 'How do you know I\'m an A-Level student?',
    a: 'For the MVP, we don\'t verify this at registration. The platform is designed for A-Level students, but we don\'t restrict access. A verification step may be introduced in a future version.',
  },
  {
    q: 'What if I don\'t know what I want at all?',
    a: 'That\'s exactly who Intelligente is built for. If you\'re an Explorer with no clear direction yet, the conversation is designed to help you discover interests and strengths you may not have articulated before.',
  },
]

export default function PricingPage() {
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
            <Link href="/features" className="hover:text-[#0c1f4a]">Features</Link>
            <Link href="/pricing" className="text-[#0c1f4a] font-medium">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#0c1f4a] font-medium">Login</Link>
            <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-[#0c1f4a] text-white hover:bg-[#1a3461] font-medium transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#0c1f4a] mb-4">Pricing</h1>
          <p className="text-lg text-[#64748b]">Simple. Honest. The full platform is free for students, today and always.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 flex flex-col ${plan.featured ? 'bg-[#0c1f4a] text-white ring-2 ring-[#0c1f4a]' : 'bg-white border border-[#e2e8f0] text-[#0c1f4a]'}`}>
              <div className="mb-4">
                <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium mb-3 ${plan.featured ? 'bg-white/15 text-white' : plan.statusColor}`}>
                  {plan.status}
                </span>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className={`text-2xl font-bold mt-1 ${plan.featured ? 'text-white' : 'text-[#0c1f4a]'}`}>{plan.price}</p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check size={14} className={`flex-shrink-0 mt-0.5 ${plan.featured ? 'text-white' : 'text-[#0c1f4a]'}`} />
                    <span className={plan.featured ? 'text-white/80' : 'text-[#64748b]'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.featured ? 'bg-white text-[#0c1f4a] hover:bg-blue-50' : 'bg-[#f1f5f9] text-[#0c1f4a] hover:bg-[#e2e8f0]'}`}
              >
                {plan.cta}
              </Link>
              {plan.microcopy && <p className={`text-center text-xs mt-2 ${plan.featured ? 'text-white/50' : 'text-[#94a3b8]'}`}>{plan.microcopy}</p>}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div id="faq">
          <h2 className="text-2xl font-bold text-[#0c1f4a] mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <span className="font-medium text-[#0c1f4a] text-sm">{faq.q}</span>
                  <ChevronDown size={16} className="text-[#94a3b8] group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-sm text-[#64748b] leading-relaxed border-t border-[#f1f5f9]">
                  <p className="pt-3">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-footer CTA */}
      <div className="bg-[#0c1f4a] py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your future doesn&apos;t need another guess.</h2>
        <p className="text-white/60 mb-6">Start a conversation. Get clarity.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0c1f4a] rounded-xl font-semibold hover:bg-blue-50 transition-colors">
          Start the Conversation <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
