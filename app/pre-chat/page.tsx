'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrainCircuit, ArrowRight, Compass, Target, GraduationCap } from 'lucide-react'

const steps = [
  {
    id: 'goal',
    question: 'What best describes you right now?',
    options: [
      { value: 'explorer', label: "I'm exploring my options", icon: Compass },
      { value: 'pathfinder', label: 'I have a career goal in mind', icon: Target },
      { value: 'visionary', label: "I've chosen a programme and want to confirm", icon: GraduationCap },
    ],
  },
  {
    id: 'interest',
    question: 'What field interests you most?',
    options: [
      { value: 'tech', label: 'Technology & Computing', icon: null },
      { value: 'business', label: 'Business & Management', icon: null },
      { value: 'science', label: 'Science & Research', icon: null },
      { value: 'arts', label: 'Arts, Design & Humanities', icon: null },
      { value: 'health', label: 'Health & Medicine', icon: null },
      { value: 'law', label: 'Law & Governance', icon: null },
    ],
  },
  {
    id: 'level',
    question: 'What level of study are you interested in?',
    options: [
      { value: 'hnd', label: 'HND', icon: null },
      { value: 'undergraduate', label: 'Undergraduate (BSc / BTech / BBA)', icon: null },
      { value: 'postgraduate', label: 'Postgraduate (MSc / MBA / MTech)', icon: null },
      { value: 'unsure', label: 'Not sure yet', icon: null },
    ],
  },
]

export default function PreChatPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)

  const currentStep = steps[step]
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (!selected) return
    const newAnswers = { ...answers, [currentStep.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (isLast) {
      sessionStorage.setItem('intelligente_prefs', JSON.stringify(newAnswers))
      router.push('/chat')
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center">
            <BrainCircuit size={16} className="text-white" />
          </div>
          <span className="font-bold text-[#0c1f4a]">Intelligente</span>
        </Link>
        <button onClick={() => router.push('/chat')} className="text-xs text-[#94a3b8] hover:text-[#64748b]">
          Skip setup
        </button>
      </div>

      <div className="h-1 bg-[#e2e8f0]">
        <div className="h-full bg-[#0c1f4a] transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-2 text-xs font-medium text-[#94a3b8] uppercase tracking-widest">
            Step {step + 1} of {steps.length}
          </div>
          <h2 className="text-2xl font-bold text-[#0c1f4a] mb-8">{currentStep.question}</h2>

          <div className={`grid gap-3 ${currentStep.options.length > 3 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {currentStep.options.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelected(opt.value)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-left transition-all font-medium text-sm
                    ${selected === opt.value
                      ? 'border-[#0c1f4a] bg-[#0c1f4a] text-white shadow-md'
                      : 'border-[#e2e8f0] bg-white text-[#0c1f4a] hover:border-[#1a3461]'}`}
                >
                  {Icon && (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected === opt.value ? 'bg-white/20' : 'bg-[#dbeafe]'}`}>
                      <Icon size={16} className={selected === opt.value ? 'text-white' : 'text-[#1a3461]'} />
                    </div>
                  )}
                  {opt.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={!selected}
            className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0c1f4a] text-white font-semibold hover:bg-[#1a3461] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLast ? 'Start My Guidance' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
