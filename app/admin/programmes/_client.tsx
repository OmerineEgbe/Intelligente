'use client'

import { useState } from 'react'
import { Search, Plus, MoreVertical, ChevronLeft, ChevronRight, Star } from 'lucide-react'

interface Programme {
  id: string
  name: string
  qualification: string
  degree_field?: string
  status: string
  school?: {
    id: string
    name: string
    unit_type: string
    university_id: string
    universities?: { name: string; short_name: string }
  }
}

interface University { id: string; name: string; short_name: string; institution_type: string }

const PAGE_SIZE = 10

const QUAL_COLOR: Record<string, string> = {
  hnd: 'bg-blue-50 text-blue-700',
  btech: 'bg-purple-50 text-purple-700',
  bsc: 'bg-purple-50 text-purple-700',
  ba: 'bg-purple-50 text-purple-700',
  bba: 'bg-purple-50 text-purple-700',
  msc: 'bg-orange-50 text-orange-700',
  mba: 'bg-orange-50 text-orange-700',
  phd: 'bg-red-50 text-red-700',
}

function qualColor(q: string) {
  return QUAL_COLOR[q?.toLowerCase()] ?? 'bg-[#f8fafc] text-[#64748b]'
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={11} className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-[#e2e8f0]'} />
      ))}
    </div>
  )
}

export function ProgrammesClient({ initialProgrammes, universities }: { initialProgrammes: Programme[]; universities: University[] }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')
  const [uniFilter, setUniFilter] = useState('')
  const [page, setPage] = useState(1)

  const filtered = initialProgrammes.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.degree_field ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || p.status === tab
    const matchUni = !uniFilter || p.school?.university_id === uniFilter
    return matchSearch && matchTab && matchUni
  })

  const counts = {
    all: initialProgrammes.length,
    active: initialProgrammes.filter(p => p.status === 'active').length,
    inactive: initialProgrammes.filter(p => p.status === 'inactive').length,
    draft: initialProgrammes.filter(p => p.status === 'draft').length,
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg w-full focus:outline-none focus:border-[#0c1f4a] placeholder:text-[#94a3b8]"
            placeholder="Search programmes…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="px-3 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg text-[#64748b] focus:outline-none focus:border-[#0c1f4a]"
          value={uniFilter}
          onChange={e => { setUniFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Universities</option>
          {universities.map(u => <option key={u.id} value={u.id}>{u.short_name}</option>)}
        </select>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors ml-auto">
          <Plus size={15} /> Add Programme
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e2e8f0] mb-5">
        {(['all', 'active', 'inactive', 'draft'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1) }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === t ? 'text-[#0c1f4a] border-[#0c1f4a]' : 'text-[#94a3b8] border-transparent hover:text-[#0c1f4a]'
            }`}
          >
            {t === 'all' ? `All (${counts.all})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${counts[t]})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Programme</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">University</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Faculty / School</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Popularity</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {paged.map(p => (
              <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#0c1f4a]">{p.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qualColor(p.qualification)}`}>{p.qualification}</span>
                  </div>
                  {p.degree_field && <p className="text-xs text-[#94a3b8] mt-0.5">{p.degree_field}</p>}
                </td>
                <td className="px-5 py-3 text-sm text-[#64748b]">{p.school?.universities?.short_name ?? '—'}</td>
                <td className="px-5 py-3 text-sm text-[#64748b] truncate max-w-[140px]">{p.school?.name ?? '—'}</td>
                <td className="px-5 py-3"><StarRating count={3} /></td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    p.status === 'active' ? 'bg-green-50 text-green-700'
                    : p.status === 'draft' ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-[#f8fafc] text-[#94a3b8]'
                  }`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button className="p-1.5 text-[#94a3b8] hover:text-[#0c1f4a] hover:bg-[#f8fafc] rounded-lg transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#94a3b8]">
                  {search ? 'No programmes match your search.' : 'No programmes yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
          <p className="text-xs text-[#94a3b8]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} programmes
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-[#94a3b8] disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-lg text-xs font-medium ${page === p ? 'bg-[#0c1f4a] text-white' : 'text-[#64748b] hover:bg-[#f8fafc]'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-[#94a3b8] disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
          <span className="text-xs text-[#94a3b8]">10 / page</span>
        </div>
      </div>
    </div>
  )
}
