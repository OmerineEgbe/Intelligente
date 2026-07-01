'use client'

import { useState } from 'react'
import { Search, Plus, MoreVertical, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface Career {
  name: string
  mapped_degrees: number
  description: string
  recommendation_count: number
  status: string
}

const PAGE_SIZE = 10

export function CareersClient({ careers }: { careers: Career[] }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = careers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg w-full focus:outline-none focus:border-[#0c1f4a] placeholder:text-[#94a3b8]"
            placeholder="Search careers…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors ml-auto">
          <Plus size={15} /> Add Career
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Career</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Mapped Degrees</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">LMUI Support</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {paged.map((c, i) => (
              <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-5 py-3 text-sm font-semibold text-[#0c1f4a]">{c.name}</td>
                <td className="px-5 py-3 text-sm text-[#64748b]">{c.mapped_degrees}</td>
                <td className="px-5 py-3 text-sm text-[#64748b] max-w-[260px]">
                  <span className="line-clamp-1">{c.description || '—'}</span>
                </td>
                <td className="px-5 py-3">
                  {c.mapped_degrees > 0 ? (
                    <span className="flex items-center gap-1 text-green-700 text-xs font-medium">
                      <CheckCircle size={13} /> Supported
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                      <XCircle size={13} /> Not Available
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">Active</span>
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
                  {search ? 'No careers match your search.' : 'No career data yet. Career data is generated from student conversations.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
          <p className="text-xs text-[#94a3b8]">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} careers
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
