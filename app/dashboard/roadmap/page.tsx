import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Map,
  Flag,
  Download,
  Share2,
  CheckCircle2,
  Zap,
  Calendar,
  TrendingUp,
  Briefcase,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

interface Qualification {
  name: string
  field?: string
  duration: string
}

interface ImmediateAction {
  title: string
  description?: string
  type?: string
}

interface SemesterMonth {
  month: string
  actions: string[]
}

interface LongTermItem {
  year: string | number
  title: string
  description?: string
}

interface CareerDestination {
  title: string
  description?: string
  salary_entry?: string
  salary_mid?: string
  salary_senior?: string
  industries?: string[]
}

interface Pathway {
  qualifications?: Qualification[]
  immediate_actions?: ImmediateAction[]
  semester_plan?: SemesterMonth[]
  long_term?: LongTermItem[]
  career_destination?: CareerDestination
}

// ── Action type icon helper ────────────────────────────────────────────────

const ACTION_ICONS: Record<string, React.ReactNode> = {
  research: <Map size={14} />,
  apply: <CheckCircle2 size={14} />,
  build: <Zap size={14} />,
  learn: <TrendingUp size={14} />,
  network: <Briefcase size={14} />,
}

function ActionIcon({ type }: { type?: string }) {
  const icon = type && ACTION_ICONS[type.toLowerCase()]
    ? ACTION_ICONS[type.toLowerCase()]
    : <CheckCircle2 size={14} />
  return (
    <div className="w-7 h-7 rounded-lg bg-[#dbeafe] flex items-center justify-center text-[#1a3461] flex-shrink-0 mt-0.5">
      {icon}
    </div>
  )
}

// ── Placeholder data (shown when pathway fields are missing) ───────────────

const PLACEHOLDER_QUALIFICATIONS: Qualification[] = [
  { name: 'HND Computer Engineering', duration: '2 Years' },
  { name: 'Top-Up BTech Software Engineering', duration: '1 Year' },
  { name: 'BTech Software Engineering', duration: 'Final Year' },
]

const PLACEHOLDER_IMMEDIATE: ImmediateAction[] = [
  { title: 'Research top-up degree entry requirements', description: 'Identify universities offering direct entry for HND holders.', type: 'research' },
  { title: 'Gather and certify your HND transcripts', description: 'Contact your institution\'s registrar for official copies.', type: 'apply' },
  { title: 'Build a simple portfolio project', description: 'Publish one project on GitHub to demonstrate practical skills.', type: 'build' },
  { title: 'Join a developer community online', description: 'Engage on Stack Overflow, GitHub Discussions, or Discord.', type: 'network' },
]

const PLACEHOLDER_SEMESTER: SemesterMonth[] = [
  { month: 'Month 1–2', actions: ['Complete top-up application forms', 'Request two academic references'] },
  { month: 'Month 3–4', actions: ['Attend open days / virtual info sessions', 'Prepare personal statement'] },
  { month: 'Month 5–6', actions: ['Finalise enrolment', 'Set up student tools and learning environment'] },
]

const PLACEHOLDER_LONG_TERM: LongTermItem[] = [
  { year: 'Year 1', title: 'Complete Top-Up Degree', description: 'Focus on core software engineering modules and capstone project.' },
  { year: 'Year 2', title: 'First Industry Role', description: 'Target junior/graduate software engineer positions in Cameroon & the region.' },
  { year: 'Year 3–5', title: 'Mid-Level Growth', description: 'Specialise in a domain (web, mobile, cloud) and take on leadership responsibilities.' },
]

const PLACEHOLDER_CAREER: CareerDestination = {
  title: 'Software Engineer',
  description: 'You will design, build, and maintain software solutions that power apps and technologies used by millions.',
  salary_entry: '300,000 – 500,000 XAF / month',
  salary_mid: '600,000 – 1,000,000 XAF / month',
  salary_senior: '1,200,000 – 2,500,000 XAF / month',
  industries: ['Tech', 'FinTech', 'Telecom', 'E-Commerce', 'Government IT'],
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function RoadmapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roadmap } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!roadmap) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">Your Personalized Roadmap</h1>
        <p className="text-[#64748b] text-sm mb-8">A step-by-step guide from where you are now to your dream career.</p>
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#dbeafe] flex items-center justify-center mx-auto mb-4">
            <Map size={26} className="text-[#1a3461]" />
          </div>
          <h2 className="text-lg font-semibold text-[#0c1f4a] mb-2">No roadmap yet</h2>
          <p className="text-[#64748b] text-sm mb-6 max-w-xs mx-auto">
            Complete a discovery conversation and generate your profile to unlock your personalized roadmap.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0c1f4a] text-white rounded-xl text-sm font-medium hover:bg-[#1a3461] transition-colors"
          >
            Generate My Profile <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  // ── Resolve pathway data ─────────────────────────────────────────────────
  const pathway = (roadmap.pathway as Pathway) ?? {}
  const qualifications: Qualification[] = pathway.qualifications?.length
    ? pathway.qualifications
    : PLACEHOLDER_QUALIFICATIONS
  const immediateActions: ImmediateAction[] = pathway.immediate_actions?.length
    ? pathway.immediate_actions
    : PLACEHOLDER_IMMEDIATE
  const semesterPlan: SemesterMonth[] = pathway.semester_plan?.length
    ? pathway.semester_plan
    : PLACEHOLDER_SEMESTER
  const longTerm: LongTermItem[] = pathway.long_term?.length
    ? pathway.long_term
    : PLACEHOLDER_LONG_TERM
  const career: CareerDestination = pathway.career_destination ?? PLACEHOLDER_CAREER

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0c1f4a] mb-1">Your Personalized Roadmap</h1>
          <p className="text-[#64748b] text-sm">A step-by-step guide from where you are now to your dream career.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#0c1f4a] text-sm font-medium hover:bg-[#f8fafc] transition-colors">
            <Share2 size={14} />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors">
            <Download size={14} />
            Download Roadmap
          </button>
        </div>
      </div>

      {/* ── Section 1 — Qualification Pathway ──────────────────────────── */}
      <section className="bg-white rounded-2xl border border-[#e2e8f0] p-6 md:p-8">
        <h2 className="text-base font-semibold text-[#0c1f4a] mb-6">Qualification Pathway</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-0">
          {qualifications.map((q, i) => (
            <div key={i} className="flex flex-col md:flex-row items-start md:items-center flex-1 min-w-0">
              {/* Step node */}
              <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2 flex-1 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#dbeafe] border-2 border-[#1a3461] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#1a3461]">{i + 1}</span>
                </div>
                <div className="md:text-center min-w-0">
                  <p className="text-sm font-semibold text-[#0c1f4a] leading-tight">{q.name}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{q.duration}</p>
                </div>
              </div>
              {/* Connector (not after last step) */}
              {i < qualifications.length - 1 && (
                <div className="flex md:items-center mx-3 my-2 md:my-0">
                  <ArrowRight size={16} className="text-[#94a3b8] rotate-90 md:rotate-0 flex-shrink-0" />
                </div>
              )}
            </div>
          ))}

          {/* Goal node */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-0">
            <div className="flex items-center mx-3 my-2 md:my-0">
              <ArrowRight size={16} className="text-[#94a3b8] rotate-90 md:rotate-0 flex-shrink-0" />
            </div>
            <div className="flex flex-row md:flex-col items-center gap-3 md:gap-2">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#0c1f4a] flex items-center justify-center">
                <Flag size={14} className="text-white" />
              </div>
              <div className="md:text-center">
                <p className="text-xs text-[#64748b] font-medium uppercase tracking-wide">Your Goal</p>
                <p className="text-sm font-bold text-[#0c1f4a]">{career.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2 — Three-column action plan ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Column 1 — Immediate Actions */}
        <section className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#dbeafe]">
            <div className="flex items-center gap-2 mb-0.5">
              <Zap size={15} className="text-[#1a3461]" />
              <h2 className="text-sm font-semibold text-[#1a3461]">Immediate Actions</h2>
            </div>
            <p className="text-xs text-[#1a3461]/70">Next 2–4 Weeks</p>
          </div>
          <div className="p-5 flex-1">
            <ol className="space-y-4">
              {immediateActions.map((action, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0c1f4a] flex items-center justify-center text-[10px] font-bold text-white mt-0.5">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0c1f4a] leading-snug">{action.title}</p>
                    {action.description && (
                      <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{action.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Column 2 — This Semester */}
        <section className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#f0fdf4]">
            <div className="flex items-center gap-2 mb-0.5">
              <Calendar size={15} className="text-green-700" />
              <h2 className="text-sm font-semibold text-green-800">This Semester</h2>
            </div>
            <p className="text-xs text-green-700/70">Month-by-month milestones</p>
          </div>
          <div className="p-5 flex-1">
            <div className="relative space-y-5">
              {/* Vertical timeline line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#e2e8f0]" />
              {semesterPlan.map((entry, i) => (
                <div key={i} className="flex gap-3 relative">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center z-10 mt-0.5" />
                  <div className="min-w-0 pb-1">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">{entry.month}</p>
                    <ul className="space-y-1">
                      {entry.actions.map((a, j) => (
                        <li key={j} className="text-xs text-[#374151] flex gap-1.5 items-start">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Column 3 — Long-Term Journey */}
        <section className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#fef3c7]">
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingUp size={15} className="text-yellow-800" />
              <h2 className="text-sm font-semibold text-yellow-900">Long-Term Journey</h2>
            </div>
            <p className="text-xs text-yellow-800/70">Year-by-year milestones</p>
          </div>
          <div className="p-5 flex-1">
            <div className="space-y-5">
              {longTerm.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-6 rounded-full bg-[#fef3c7] border border-yellow-300 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-yellow-800">{item.year}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0c1f4a] leading-snug">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Section 3 — Career Destination ─────────────────────────────── */}
      <section className="bg-[#0c1f4a] rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Briefcase size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest font-medium mb-0.5">Career Destination</p>
            <h2 className="text-xl font-bold text-white">{career.title}</h2>
          </div>
        </div>

        {career.description && (
          <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-2xl">{career.description}</p>
        )}

        {/* Salary table */}
        {(career.salary_entry || career.salary_mid || career.salary_senior) && (
          <div className="mb-6">
            <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-3">Salary Ranges</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Entry Level', value: career.salary_entry },
                { label: 'Mid-Level', value: career.salary_mid },
                { label: 'Senior Level', value: career.salary_senior },
              ].filter(s => s.value).map((salary) => (
                <div key={salary.label} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1">{salary.label}</p>
                  <p className="text-sm font-semibold text-white">{salary.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industries */}
        {career.industries && career.industries.length > 0 && (
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2">Top Industries</p>
            <div className="flex flex-wrap gap-2">
              {career.industries.map((industry) => (
                <span
                  key={industry}
                  className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-white/80 font-medium"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  )
}
