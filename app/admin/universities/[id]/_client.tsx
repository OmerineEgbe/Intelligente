'use client'

import { useState, useCallback } from 'react'
import {
  Plus, Search, Edit2, Trash2, ChevronRight, X, Check,
  AlertCircle, BookOpen, Building2, GraduationCap, FolderOpen,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface University {
  id: string
  name: string
  short_name: string
  institution_type: 'government' | 'private'
  city?: string
  country?: string
  website?: string
  description?: string
  status: string
}

interface Unit {
  id: string
  name: string
  unit_type: string
  university_id: string
  parent_id: string | null
  description?: string
  parent?: { id: string; name: string; unit_type: string } | null
}

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
  school?: { id: string; name: string; unit_type: string }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputClass = 'w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#0c1f4a] focus:outline-none focus:border-[#0c1f4a]'

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

// Government top-level types, private top-level types, and sub-unit
const GOV_ROOT_TYPES = ['faculty', 'college', 'school', 'institute', 'centre']
const PRIV_ROOT_TYPES = ['school', 'college', 'institute', 'centre']
const DEPT_TYPE = 'department'

function unitLabel(type: string) {
  const map: Record<string, string> = {
    faculty: 'Faculty', school: 'School', college: 'College',
    institute: 'Institute', centre: 'Centre', department: 'Department',
  }
  return map[type] ?? type
}

function qualColor(q: string) {
  return QUAL_COLOR[q?.toLowerCase()] ?? 'bg-[#f8fafc] text-[#64748b]'
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <p className="text-sm text-[#0c1f4a] mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Unit icon by type ──────────────────────────────────────────────────────────

function UnitIcon({ type, size = 16 }: { type: string; size?: number }) {
  if (type === 'department') return <FolderOpen size={size} className="text-[#64748b]" />
  return <Building2 size={size} className="text-[#0c1f4a]" />
}

// ── Main client ───────────────────────────────────────────────────────────────

export function UniversityManageClient({
  university,
  initialUnits,
  initialProgrammes,
}: {
  university: University
  initialUnits: Unit[]
  initialProgrammes: Programme[]
}) {
  const isGov = university.institution_type === 'government'

  const [tab, setTab] = useState<'units' | 'programmes'>('units')
  const [units, setUnits] = useState(initialUnits)
  const [programmes, setProgrammes] = useState(initialProgrammes)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [confirm, setConfirm] = useState<{ message: string; action: () => void } | null>(null)

  // Unit modal state
  const [unitModal, setUnitModal] = useState<null | 'add' | Unit>(null)
  const [unitForm, setUnitForm] = useState({ name: '', unit_type: isGov ? 'faculty' : 'school', parent_id: '', description: '' })
  const [unitSaving, setUnitSaving] = useState(false)

  // Programme modal state
  const [progModal, setProgModal] = useState<null | 'add' | Programme>(null)
  const emptyProg = { name: '', qualification: 'bsc', degree_field: '', duration: '', school_id: '', entry_requirements: '', level: 'undergraduate', mode: 'full-time', description: '', tuition_fee: '', status: 'active' }
  const [progForm, setProgForm] = useState(emptyProg)
  const [progSaving, setProgSaving] = useState(false)

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Reload helpers ─────────────────────────────────────────────────────────

  const reloadUnits = async () => {
    const res = await fetch(`/api/admin/units?university_id=${university.id}`)
    const j = await res.json()
    setUnits(j.units ?? [])
  }

  const reloadProgrammes = async () => {
    const res = await fetch(`/api/admin/programmes?university_id=${university.id}`)
    const j = await res.json()
    setProgrammes(j.programmes ?? [])
  }

  // ── Unit CRUD ──────────────────────────────────────────────────────────────

  const openAddUnit = (parentId?: string) => {
    const defaultType = parentId ? DEPT_TYPE : (isGov ? 'faculty' : 'school')
    setUnitForm({ name: '', unit_type: defaultType, parent_id: parentId ?? '', description: '' })
    setUnitModal('add')
  }

  const openEditUnit = (u: Unit) => {
    setUnitForm({ name: u.name, unit_type: u.unit_type, parent_id: u.parent_id ?? '', description: u.description ?? '' })
    setUnitModal(u)
  }

  const saveUnit = async () => {
    setUnitSaving(true)
    try {
      const isEdit = unitModal !== 'add' && unitModal !== null
      const body = isEdit
        ? { id: (unitModal as Unit).id, name: unitForm.name, unit_type: unitForm.unit_type, parent_id: unitForm.parent_id || null, description: unitForm.description }
        : { university_id: university.id, name: unitForm.name, unit_type: unitForm.unit_type, parent_id: unitForm.parent_id || null, description: unitForm.description }

      const res = await fetch('/api/admin/units', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      showToast(isEdit ? 'Academic unit updated' : 'Academic unit added', 'success')
      setUnitModal(null)
      reloadUnits()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save', 'error')
    } finally {
      setUnitSaving(false)
    }
  }

  const deleteUnit = (id: string) => {
    setConfirm({
      message: 'Delete this academic unit? All sub-units and programmes inside will also be removed.',
      action: async () => {
        setConfirm(null)
        const res = await fetch('/api/admin/units', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        if (res.ok) { showToast('Unit deleted', 'success'); reloadUnits(); reloadProgrammes() }
        else showToast('Failed to delete', 'error')
      },
    })
  }

  // ── Programme CRUD ─────────────────────────────────────────────────────────

  const openAddProg = (schoolId?: string) => {
    setProgForm({ ...emptyProg, school_id: schoolId ?? '' })
    setProgModal('add')
  }

  const openEditProg = (p: Programme) => {
    setProgForm({
      name: p.name, qualification: p.qualification, degree_field: p.degree_field ?? '',
      duration: p.duration ?? '', school_id: p.school_id, entry_requirements: p.entry_requirements ?? '',
      level: p.level ?? 'undergraduate', mode: p.mode ?? 'full-time',
      description: p.description ?? '', tuition_fee: p.tuition_fee ?? '', status: p.status,
    })
    setProgModal(p)
  }

  const saveProg = async () => {
    setProgSaving(true)
    try {
      const isEdit = progModal !== 'add' && progModal !== null
      const body = isEdit
        ? { id: (progModal as Programme).id, ...progForm }
        : progForm

      const res = await fetch('/api/admin/programmes', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      showToast(isEdit ? 'Programme updated' : 'Programme added', 'success')
      setProgModal(null)
      reloadProgrammes()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save', 'error')
    } finally {
      setProgSaving(false)
    }
  }

  const deleteProg = (id: string) => {
    setConfirm({
      message: 'Delete this programme?',
      action: async () => {
        setConfirm(null)
        const res = await fetch('/api/admin/programmes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        if (res.ok) { showToast('Programme deleted', 'success'); reloadProgrammes() }
        else showToast('Failed to delete', 'error')
      },
    })
  }

  // ── Tree helpers ───────────────────────────────────────────────────────────

  const rootUnits = units.filter(u => !u.parent_id)
  const childUnits = (parentId: string) => units.filter(u => u.parent_id === parentId)
  const unitProgs = (unitId: string) => programmes.filter(p => p.school_id === unitId)

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filteredProgrammes = programmes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.degree_field ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Render: Academic Units Tree ────────────────────────────────────────────

  function UnitRow({ unit, depth = 0 }: { unit: Unit; depth?: number }) {
    const children = childUnits(unit.id)
    const progs = unitProgs(unit.id)
    const canHaveChildren = isGov && unit.unit_type !== DEPT_TYPE

    return (
      <div className={depth > 0 ? 'ml-6 border-l border-[#e2e8f0] pl-4' : ''}>
        {/* Unit header */}
        <div className="flex items-center justify-between py-2.5 group">
          <div className="flex items-center gap-2.5 min-w-0">
            <UnitIcon type={unit.unit_type} size={15} />
            <div className="min-w-0">
              <span className="text-sm font-medium text-[#0c1f4a] truncate block">{unit.name}</span>
              <span className="text-[10px] text-[#94a3b8]">{unitLabel(unit.unit_type)} · {progs.length} programme{progs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canHaveChildren && (
              <button
                onClick={() => openAddUnit(unit.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-[#64748b] hover:text-[#0c1f4a] hover:bg-[#f0f4ff] transition-colors"
              >
                <Plus size={11} /> Dept
              </button>
            )}
            <button
              onClick={() => openAddProg(unit.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-[#64748b] hover:text-[#0c1f4a] hover:bg-[#f0f4ff] transition-colors"
            >
              <Plus size={11} /> Programme
            </button>
            <button onClick={() => openEditUnit(unit)} className="p-1.5 text-[#94a3b8] hover:text-[#0c1f4a] hover:bg-[#f8fafc] rounded-lg transition-colors">
              <Edit2 size={13} />
            </button>
            <button onClick={() => deleteUnit(unit.id)} className="p-1.5 text-[#94a3b8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Programmes under this unit */}
        {progs.length > 0 && (
          <div className="ml-6 space-y-1 mb-2">
            {progs.map(p => (
              <div key={p.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-[#f8fafc] group/prog transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <GraduationCap size={13} className="text-[#94a3b8] flex-shrink-0" />
                  <span className="text-xs text-[#0c1f4a] truncate">{p.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${qualColor(p.qualification)}`}>{p.qualification?.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/prog:opacity-100 transition-opacity">
                  <button onClick={() => openEditProg(p)} className="p-1 text-[#94a3b8] hover:text-[#0c1f4a] rounded transition-colors">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => deleteProg(p.id)} className="p-1 text-[#94a3b8] hover:text-red-600 rounded transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Children */}
        {children.map(child => <UnitRow key={child.id} unit={child} depth={depth + 1} />)}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const rootTypes = isGov ? GOV_ROOT_TYPES : PRIV_ROOT_TYPES

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Academic Units', value: units.length, icon: Building2 },
          { label: 'Programmes', value: programmes.length, icon: BookOpen },
          { label: 'Type', value: university.institution_type === 'government' ? 'Government' : 'Private', icon: GraduationCap },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f0f4ff] flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-[#0c1f4a]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0c1f4a]">{value}</p>
              <p className="text-[10px] text-[#94a3b8]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e2e8f0]">
        {(['units', 'programmes'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'text-[#0c1f4a] border-[#0c1f4a]' : 'text-[#94a3b8] border-transparent hover:text-[#0c1f4a]'
            }`}
          >
            {t === 'units' ? `Academic Units (${units.length})` : `Programmes (${programmes.length})`}
          </button>
        ))}
      </div>

      {/* ── Academic Units Tab ── */}
      {tab === 'units' && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0c1f4a]">
              {isGov ? 'Faculties, Colleges & Departments' : 'Schools & Colleges'}
            </h3>
            <button
              onClick={() => openAddUnit()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1f4a] text-white text-xs font-medium hover:bg-[#1a3461] transition-colors"
            >
              <Plus size={13} /> Add {isGov ? 'Faculty / College' : 'School / College'}
            </button>
          </div>

          {rootUnits.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={32} className="text-[#e2e8f0] mx-auto mb-3" />
              <p className="text-sm text-[#94a3b8] mb-3">No academic units yet</p>
              <button
                onClick={() => openAddUnit()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors"
              >
                <Plus size={14} /> Add first {isGov ? 'faculty' : 'school'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {rootUnits.map(u => <UnitRow key={u.id} unit={u} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Programmes Tab ── */}
      {tab === 'programmes' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                className="pl-9 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-lg w-full focus:outline-none focus:border-[#0c1f4a] placeholder:text-[#94a3b8]"
                placeholder="Search programmes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => openAddProg()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0c1f4a] text-white text-sm font-medium hover:bg-[#1a3461] transition-colors ml-auto"
            >
              <Plus size={15} /> Add Programme
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Programme</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Unit</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Level</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#64748b] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredProgrammes.map(p => (
                  <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#0c1f4a]">{p.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${qualColor(p.qualification)}`}>{p.qualification?.toUpperCase()}</span>
                      </div>
                      {p.degree_field && <p className="text-xs text-[#94a3b8] mt-0.5">{p.degree_field}</p>}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#64748b] truncate max-w-[160px]">{p.school?.name ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-[#64748b] capitalize">{p.level ?? '—'}</td>
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
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEditProg(p)} className="p-1.5 text-[#94a3b8] hover:text-[#0c1f4a] hover:bg-[#f8fafc] rounded-lg transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => deleteProg(p.id)} className="p-1.5 text-[#94a3b8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProgrammes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#94a3b8]">
                      {search ? 'No programmes match your search.' : 'No programmes yet. Add one above or from the Academic Units tab.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Unit Modal ── */}
      {unitModal && (
        <Modal
          title={unitModal === 'add' ? `Add Academic Unit` : `Edit ${unitLabel((unitModal as Unit).unit_type)}`}
          onClose={() => setUnitModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Name</label>
              <input className={inputClass} value={unitForm.name} onChange={e => setUnitForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Faculty of Engineering" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Unit Type</label>
                <select className={inputClass} value={unitForm.unit_type} onChange={e => setUnitForm(f => ({ ...f, unit_type: e.target.value }))}>
                  {rootTypes.map(t => <option key={t} value={t}>{unitLabel(t)}</option>)}
                  {isGov && <option value="department">Department</option>}
                </select>
              </div>
              {isGov && (
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Parent Unit (optional)</label>
                  <select className={inputClass} value={unitForm.parent_id} onChange={e => setUnitForm(f => ({ ...f, parent_id: e.target.value }))}>
                    <option value="">None (top-level)</option>
                    {units.filter(u => u.unit_type !== DEPT_TYPE).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Description (optional)</label>
              <textarea className={inputClass} rows={2} value={unitForm.description} onChange={e => setUnitForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setUnitModal(null)} className="px-4 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
              <button onClick={saveUnit} disabled={unitSaving || !unitForm.name} className="px-4 py-2 text-sm rounded-lg bg-[#0c1f4a] text-white disabled:opacity-50">
                {unitSaving ? 'Saving…' : unitModal === 'add' ? 'Add Unit' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Programme Modal ── */}
      {progModal && (
        <Modal
          title={progModal === 'add' ? 'Add Programme' : 'Edit Programme'}
          onClose={() => setProgModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Programme Name</label>
              <input className={inputClass} value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Computer Engineering" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Academic Unit</label>
                <select className={inputClass} value={progForm.school_id} onChange={e => setProgForm(f => ({ ...f, school_id: e.target.value }))}>
                  <option value="">Select unit…</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name} ({unitLabel(u.unit_type)})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Qualification</label>
                <select className={inputClass} value={progForm.qualification} onChange={e => setProgForm(f => ({ ...f, qualification: e.target.value }))}>
                  {['hnd', 'bsc', 'ba', 'bba', 'btech', 'msc', 'mba', 'phd', 'diploma', 'certificate'].map(q => (
                    <option key={q} value={q}>{q.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Level</label>
                <select className={inputClass} value={progForm.level} onChange={e => setProgForm(f => ({ ...f, level: e.target.value }))}>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="professional">Professional</option>
                  <option value="certificate">Certificate</option>
                  <option value="diploma">Diploma</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Mode</label>
                <select className={inputClass} value={progForm.mode} onChange={e => setProgForm(f => ({ ...f, mode: e.target.value }))}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="distance">Distance</option>
                  <option value="blended">Blended</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Degree Field</label>
                <input className={inputClass} value={progForm.degree_field} onChange={e => setProgForm(f => ({ ...f, degree_field: e.target.value }))} placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Duration</label>
                <input className={inputClass} value={progForm.duration} onChange={e => setProgForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 3 years" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Tuition Fee</label>
                <input className={inputClass} value={progForm.tuition_fee} onChange={e => setProgForm(f => ({ ...f, tuition_fee: e.target.value }))} placeholder="e.g. 450,000 XAF/year" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Status</label>
                <select className={inputClass} value={progForm.status} onChange={e => setProgForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Entry Requirements</label>
              <textarea className={inputClass} rows={2} value={progForm.entry_requirements} onChange={e => setProgForm(f => ({ ...f, entry_requirements: e.target.value }))} placeholder="e.g. GCE A-Levels with passes in Mathematics and Physics" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setProgModal(null)} className="px-4 py-2 text-sm rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
              <button onClick={saveProg} disabled={progSaving || !progForm.name || !progForm.school_id} className="px-4 py-2 text-sm rounded-lg bg-[#0c1f4a] text-white disabled:opacity-50">
                {progSaving ? 'Saving…' : progModal === 'add' ? 'Add Programme' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
