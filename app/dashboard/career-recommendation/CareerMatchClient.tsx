'use client'

import { useState } from 'react'
import { CheckCircle, ArrowRight, ChevronDown, ChevronUp, TrendingUp, BarChart2 } from 'lucide-react'
import Link from 'next/link'

interface CareerMatch {
  career_name: string
  match_score: number
  fit_verdict: string
  why_matched: string[]
  demand: string
  growth_outlook: string
  typical_salary: string
  description?: string
  is_primary: boolean
}

export function OtherMatchesList({ careers }: { careers: CareerMatch[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {careers.map((career, i) => (
        <div key={i} className="rounded-xl border border-[#e2e8f0] overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="flex items-center justify-between w-full px-4 py-3 hover:bg-[#f8fafc] transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-base">💼</span>
              <span className="text-sm font-semibold text-[#0c1f4a]">{career.career_name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-bold text-[#1a3461] bg-[#dbeafe] px-2 py-0.5 rounded-full">
                {career.match_score}%
              </span>
              {expanded === i
                ? <ChevronUp size={14} className="text-[#94a3b8]" />
                : <ChevronDown size={14} className="text-[#94a3b8]" />
              }
            </div>
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 border-t border-[#f1f5f9]">
              {career.description && (
                <p className="text-xs text-[#64748b] leading-relaxed mt-3 mb-3">{career.description}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {career.demand && (
                  <div className="bg-[#f8fafc] rounded-lg p-2.5">
                    <div className="flex items-center gap-1 text-[#94a3b8] mb-0.5">
                      <BarChart2 size={10} />
                      <span className="text-[9px] uppercase tracking-wide">Demand</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0c1f4a]">{career.demand}</p>
                  </div>
                )}
                {career.growth_outlook && (
                  <div className="bg-[#f8fafc] rounded-lg p-2.5">
                    <div className="flex items-center gap-1 text-[#94a3b8] mb-0.5">
                      <TrendingUp size={10} />
                      <span className="text-[9px] uppercase tracking-wide">Growth</span>
                    </div>
                    <p className="text-xs font-semibold text-[#0c1f4a]">{career.growth_outlook}</p>
                  </div>
                )}
              </div>
              {career.typical_salary && (
                <p className="text-xs text-[#64748b] mb-3">
                  <span className="font-medium text-[#0c1f4a]">Entry salary:</span> {career.typical_salary}
                </p>
              )}

              {/* Why matched */}
              {career.why_matched?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Why this fits you</p>
                  {career.why_matched.map((reason, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-[#64748b] leading-snug">{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function WhyFitsPanel({ reasons }: { reasons: string[] }) {
  const [showAll, setShowAll] = useState(false)
  const displayed = showAll ? reasons : reasons.slice(0, 3)

  return (
    <>
      <ul className="space-y-3">
        {displayed.map((reason, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-[#64748b] leading-snug">{reason}</span>
          </li>
        ))}
      </ul>
      {reasons.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a3461] hover:text-[#0c1f4a] mt-4 transition-colors"
        >
          {showAll ? 'Show less' : `Show ${reasons.length - 3} more reasons`}
          {showAll ? <ChevronUp size={11} /> : <ArrowRight size={11} />}
        </button>
      )}
    </>
  )
}
