'use client'

import { useState, useCallback } from 'react'
import { Plus, Search, Building2, Edit2, Trash2, ChevronRight, X, Check, AlertCircle } from 'lucide-react'

interface University {
  id: string
  name: string
  short_name: string
  institution_type: string
  country: string
  city: string
  website: string
  description: string
  status: string
  created_at: string
  school_count: number
}

function Toast({ msg, type, onDismiss }: { msg: string; type: 'success' | 'error'; onDismiss: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      {msg}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <h3 className="font-semibold text-[#0c1f4a]">{title}</h3>
          <button onClick={onClose}><X size={18} className="text-[#94a3b8] hover:text-[#0c1f4a]" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const inputClass = "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#0c1f4a] focus:outline-none focus:border-[#0c1f4a]"

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  coming_soon: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  inactive: 'bg-[#f8fafc] text-[#94a3b8] border-[#e2e8f0]',
}

const TYPE_COLOR: Record<string, string> = {
  private: 'bg-blue-50 text-blue-700 border-blue-200',
  government: 'bg-purple-50 text-purple-700 border-purple-200',
}

export function UniversitiesClient({ initialData }: { initialData: University[] }) {
  const [universities, setUniversities] = useState(initialData)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<null | 'add' | University>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const emptyForm = { name: '', short_name: '', institution_type: 'private', country: 'Cameroon', city: '', website: '', description: '', status: 'coming_soon' }
  const [form, setForm] = useState(emptyForm)

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const reload = async () => {
    const res = await fetch('/api/admin/universities')
    const j = await res.json()
    setUniversities((j.universities ?? []).map((u: University & { schools?: { id: string }[] }) => ({ ...u, school_count: (u.schools ?? []).length })))
  }

  const openAdd = () => { setForm(emptyForm); setModal('add') }
  const openEdit = (u: University) => {
    setForm({ name: u.name, short_name: u.short_name, institution_type: u.institution_type, country: u.country, city: u.city, website: u.website, description: u.description, status: u.status })
    setModal(u)
  }

  const save = async () => {
    setSaving(true)
    try {
      const isEdit = modal !== 'add' && modal !== null
      const res = await fetch('/api/admin/universities', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: (modal as University).id, ...form } : form),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      showToast(isEdit ? 'University updated' : 'University added', 'success')
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
      const res = await fetch('/api/admin/universities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error('Failed')
      showToast('University deleted', 'success')
      reload()
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setConfirm(null)
    }
  }

  const filtered = universities.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.short_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            className="pl-9 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg text-[#0c1f4a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0c1f4a] w-full"
            placeholder="Search universities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors ml-auto"
        >
          <Plus size={15} /> Add University
        </button>
      </div>

      <p className="text-xs text-[#94a3b8] mb-4">Showing {filtered.length} of {universities.length} universities</p>

      {/* University cards */}
      <div className="space-y-3">
        {filtered.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 hover:border-[#1a3461] hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-4">
              {/* Left */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-[#f0f4ff] border border-[#dbeafe] flex items-center justify-center flex-shrink-0">
                  <Building2 size={20} className="text-[#0c1f4a]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-[#0c1f4a]">{u.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[u.status] ?? STATUS_COLOR.inactive}`}>
                      {u.status === 'coming_soon' ? 'Coming Soon' : u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLOR[u.institution_type] ?? TYPE_COLOR.private}`}>
                      {u.institution_type.charAt(0).toUpperCase() + u.institution_type.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    {u.city && <span>📍 {u.city}, {u.country}</span>}
                    {u.website && <span>🌐 {u.website.replace('https://', '').replace('http://', '')}</span>}
                  </div>
                  {/* Stats row */}
                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <p className="text-base font-bold text-[#0c1f4a]">{u.school_count}</p>
                      <p className="text-[10px] text-[#94a3b8]">Academic Units</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#0c1f4a]">0</p>
                      <p className="text-[10px] text-[#94a3b8]">Students</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#0c1f4a]">0</p>
                      <p className="text-[10px] text-[#94a3b8]">Applications</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(u)} className="p-2 text-[#94a3b8] hover:text-[#0c1f4a] hover:bg-[#f8fafc] rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setConfirm(u.id)} className="p-2 text-[#94a3b8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-[#94a3b8]">
                  Joined {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0c1f4a] text-white text-xs font-medium hover:bg-[#1a3461] transition-colors">
                  Manage <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-[#94a3b8]">
            {search ? 'No universities match your search.' : 'No universities yet. Add one above.'}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add University' : 'Edit University'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Full Name</label>
              <input className={inputClass} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. University of Buea" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Abbreviation</label>
                <input className={inputClass} value={form.short_name} onChange={e => setForm(f => ({ ...f, short_name: e.target.value.toUpperCase() }))} placeholder="e.g. UB" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Type</label>
                <select className={inputClass} value={form.institution_type} onChange={e => setForm(f => ({ ...f, institution_type: e.target.value }))}>
                  <option value="private">Private</option>
                  <option value="government">Government</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Country</label>
                <input className={inputClass} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">City</label>
                <input className={inputClass} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="e.g. Buea" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Website</label>
              <input className={inputClass} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Status</label>
              <select className={inputClass} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.short_name} className="px-4 py-2 text-sm rounded-lg bg-[#0c1f4a] text-white disabled:opacity-50">
                {saving ? 'Saving…' : modal === 'add' ? 'Add University' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <p className="text-sm text-[#0c1f4a] mb-5">Delete this university? All academic units and programmes will also be removed.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
              <button onClick={() => del(confirm)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}
