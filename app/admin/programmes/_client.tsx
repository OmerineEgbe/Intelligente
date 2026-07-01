'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Plus, MoreVertical, ChevronLeft, ChevronRight, Star, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react'

interface Programme {
  id: string
  name: string
  qualification: string
  degree_field?: string
  duration?: string
  entry_requirements?: string
  level?: string
  mode?: string
  description?: string
  tuition_fee?: string
  status: string
  school_id: string
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

const inputClass = 'w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#0c1f4a] focus:outline-none focus:border-[#0c1f4a]'

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] flex-shrink-0">
          <h3 className="font-semibold text-[#0c1f4a]">{title}</h3>
          <button onClick={onClose}><X size={18} className="text-[#94a3b8] hover:text-[#0c1f4a]" /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 text-[#94a3b8] hover:text-[#0c1f4a] hover:bg-[#f8fafc] rounded-lg transition-colors"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-xl shadow-lg border border-[#e2e8f0] py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[#374151] hover:bg-[#f8fafc] transition-colors"
          >
            <Edit2 size={13} className="text-[#64748b]" /> Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export function ProgrammesClient({ initialProgrammes, universities }: { initialProgrammes: Programme[]; universities: University[] }) {
  const [programmes, setProgrammes] = useState(initialProgrammes)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')
  const [uniFilter, setUniFilter] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [modal, setModal] = useState<null | 'add' | Programme>(null)
  const [saving, setSaving] = useState(false)

  const emptyForm = {
    name: '', qualification: 'bsc', degree_field: '', duration: '',
    school_id: '', entry_requirements: '', level: 'undergraduate',
    mode: 'full-time', description: '', tuition_fee: '', status: 'active',
  }
  const [form, setForm] = useState(emptyForm)

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // All schools across all universities (for the school dropdown)
  const allSchools = programmes
    .map(p => p.school)
    .filter((s): s is NonNullable<typeof s> => !!s)
    .filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)

  const reload = async () => {
    const res = await fetch('/api/admin/programmes')
    const j = await res.json()
    setProgrammes(j.programmes ?? [])
  }

  const openAdd = () => { setForm(emptyForm); setModal('add') }
  const openEdit = (p: Programme) => {
    setForm({
      name: p.name, qualification: p.qualification, degree_field: p.degree_field ?? '',
      duration: p.duration ?? '', school_id: p.school_id, entry_requirements: p.entry_requirements ?? '',
      level: p.level ?? 'undergraduate', mode: p.mode ?? 'full-time',
      description: p.description ?? '', tuition_fee: p.tuition_fee ?? '', status: p.status,
    })
    setModal(p)
  }

  const save = async () => {
    setSaving(true)
    try {
      const isEdit = modal !== 'add' && modal !== null
      const res = await fetch('/api/admin/programmes', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: (modal as Programme).id, ...form } : form),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      showToast(isEdit ? 'Programme updated' : 'Programme added', 'success')
      setModal(null)
      reload()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    try {
      const res = await fetch('/api/admin/programmes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed')
      showToast('Programme deleted', 'success')
      reload()
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setConfirm(null)
    }
  }

  const filtered = programmes.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.degree_field ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || p.status === tab
    const matchUni = !uniFilter || p.school?.university_id === uniFilter
    return matchSearch && matchTab && matchUni
  })

  const counts = {
    all: programmes.length,
    active: programmes.filter(p => p.status === 'active').length,
    inactive: programmes.filter(p => p.status === 'inactive').length,
    draft: programmes.filter(p => p.status === 'draft').length,
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
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors ml-auto"
        >
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qualColor(p.qualification)}`}>{p.qualification?.toUpperCase()}</span>
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
                  <RowMenu onEdit={() => openEdit(p)} onDelete={() => setConfirm(p.id)} />
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#94a3b8]">
                  {search ? 'No programmes match your search.' : 'No programmes yet. Add one above or manage them from a university.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 border-t border-[#e2e8f0]">
          <p className="text-xs text-[#94a3b8]">
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} programmes
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

      {/* Add / Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Programme' : 'Edit Programme'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Programme Name</label>
              <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Computer Engineering" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Academic Unit</label>
                <select className={inputClass} value={form.school_id} onChange={e => setForm(f => ({ ...f, school_id: e.target.value }))}>
                  <option value="">Select unit…</option>
                  {allSchools.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.universities?.short_name ? `${s.universities.short_name} — ` : ''}{s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Qualification</label>
                <select className={inputClass} value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))}>
                  {['hnd', 'bsc', 'ba', 'bba', 'btech', 'msc', 'mba', 'phd', 'diploma', 'certificate'].map(q => (
                    <option key={q} value={q}>{q.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Level</label>
                <select className={inputClass} value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="professional">Professional</option>
                  <option value="certificate">Certificate</option>
                  <option value="diploma">Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Mode</label>
                <select className={inputClass} value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="distance">Distance</option>
                  <option value="blended">Blended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Degree Field</label>
                <input className={inputClass} value={form.degree_field} onChange={e => setForm(f => ({ ...f, degree_field: e.target.value }))} placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Duration</label>
                <input className={inputClass} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 3 years" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Tuition Fee</label>
                <input className={inputClass} value={form.tuition_fee} onChange={e => setForm(f => ({ ...f, tuition_fee: e.target.value }))} placeholder="e.g. 450,000 XAF/year" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Status</label>
                <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Entry Requirements</label>
              <textarea className={inputClass} rows={2} value={form.entry_requirements} onChange={e => setForm(f => ({ ...f, entry_requirements: e.target.value }))} placeholder="e.g. GCE A-Levels with passes in Mathematics and Physics" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.school_id} className="px-4 py-2 text-sm rounded-lg bg-[#0c1f4a] text-white disabled:opacity-50">
                {saving ? 'Saving…' : modal === 'add' ? 'Add Programme' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="text-sm text-[#0c1f4a] mb-5">Delete this programme? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
              <button onClick={() => del(confirm)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
