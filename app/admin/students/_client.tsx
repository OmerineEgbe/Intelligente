'use client'

import { useState } from 'react'
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  created_at: string
  current_career: string | null
  status: 'active' | 'inactive' | 'suspended'
}

const PAGE_SIZE = 10

export function StudentsClient({ students }: { students: Student[] }) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [page, setPage] = useState(1)

  const filtered = students.filter(s => {
    const matchSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.current_career ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || s.status === tab
    return matchSearch && matchTab
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const counts = {
    all: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    suspended: students.filter(s => s.status === 'suspended').length,
  }

  const initials = (name: string) => {
    const parts = name.trim().split(' ')
    return parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg text-[#0c1f4a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0c1f4a] w-full"
            placeholder="Search students…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-medium hover:bg-[#f8fafc] transition-colors ml-auto">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e2e8f0] mb-5">
        {(['all', 'active', 'inactive', 'suspended'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1) }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === t ? 'text-[#0c1f4a] border-[#0c1f4a]' : 'text-[#94a3b8] border-transparent hover:text-[#0c1f4a]'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Student</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Date Joined</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Current Career</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {paged.map(s => (
              <tr key={s.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#dbeafe] flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-[#0c1f4a]">{initials(s.full_name).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-[#0c1f4a]">{s.full_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[#64748b]">
                  {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-3 text-sm text-[#64748b]">{s.current_career ?? '—'}</td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    s.status === 'active' ? 'bg-green-50 text-green-700'
                    : s.status === 'suspended' ? 'bg-red-50 text-red-700'
                    : 'bg-[#f8fafc] text-[#94a3b8]'
                  }`}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#94a3b8]">
                  {search ? 'No students match your search.' : 'No students yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
          <p className="text-xs text-[#94a3b8]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0c1f4a] hover:bg-[#f8fafc] disabled:opacity-40 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-[#0c1f4a] text-white' : 'text-[#64748b] hover:bg-[#f8fafc]'}`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0c1f4a] hover:bg-[#f8fafc] disabled:opacity-40 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
