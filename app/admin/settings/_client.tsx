'use client'

import { useState, useCallback } from 'react'
import { Save, Plus, Trash2, X, Check, Shield, Users, Key, ChevronDown, ChevronUp } from 'lucide-react'

interface Role { id: string; name: string; description: string; color: string }
interface Permission { id: string; name: string; description: string; resource: string; action: string }
interface UserRole {
  user_id: string
  role_id: string
  assigned_at: string
  roles: { id: string; name: string; color: string } | null
  profiles: { full_name: string } | null
}

const inputClass = "w-full px-3 py-2 text-sm border border-[#e2e8f0] rounded-lg text-[#0c1f4a] focus:outline-none focus:border-[#0c1f4a]"

const GENERAL_TABS = ['General', 'Roles & Permissions', 'Branding', 'Security', 'Backup', 'API Keys', 'System Logs']

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#0c1f4a]' : 'bg-[#e2e8f0]'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <Check size={14} /> : <X size={14} />} {msg}
    </div>
  )
}

// ── Roles & Permissions Tab ────────────────────────────────────────────────

function RolesTab({
  roles, permissions, rolePermMap, userRoles,
  toast,
}: {
  roles: Role[]
  permissions: Permission[]
  rolePermMap: Record<string, string[]>
  userRoles: UserRole[]
  toast: (msg: string, type: 'success' | 'error') => void
}) {
  const [localRoles, setLocalRoles] = useState(roles)
  const [localRolePerms, setLocalRolePerms] = useState(rolePermMap)
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [addingRole, setAddingRole] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', color: '#0c1f4a' })
  const [saving, setSaving] = useState(false)

  // Group permissions by resource
  const byResource = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.resource]) acc[p.resource] = []
    acc[p.resource].push(p)
    return acc
  }, {})

  const createRole = async () => {
    if (!newRole.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error)
      setLocalRoles(r => [...r, j.role])
      setLocalRolePerms(m => ({ ...m, [j.role.id]: [] }))
      setAddingRole(false)
      setNewRole({ name: '', description: '', color: '#0c1f4a' })
      toast('Role created', 'success')
    } catch (e: any) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteRole = async (id: string) => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error('Failed')
      setLocalRoles(r => r.filter(x => x.id !== id))
      toast('Role deleted', 'success')
    } catch {
      toast('Failed to delete role', 'error')
    }
  }

  const togglePermission = async (roleId: string, permName: string, currentlyOn: boolean) => {
    try {
      const res = await fetch('/api/admin/roles/permissions', {
        method: currentlyOn ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_id: roleId, permission_name: permName }),
      })
      if (!res.ok) throw new Error('Failed')
      setLocalRolePerms(m => {
        const perms = m[roleId] ?? []
        return {
          ...m,
          [roleId]: currentlyOn ? perms.filter(p => p !== permName) : [...perms, permName],
        }
      })
    } catch {
      toast('Failed to update permission', 'error')
    }
  }

  const LOCKED_ROLES = ['admin', 'student']

  return (
    <div className="space-y-5">
      {/* Role list */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#0c1f4a]" />
            <h3 className="text-sm font-bold text-[#0c1f4a]">Roles</h3>
            <span className="text-xs text-[#94a3b8] bg-[#f8fafc] px-2 py-0.5 rounded-full">{localRoles.length}</span>
          </div>
          <button
            onClick={() => setAddingRole(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0c1f4a] text-white text-xs font-medium hover:bg-[#1a3461] transition-colors"
          >
            <Plus size={13} /> New Role
          </button>
        </div>

        {addingRole && (
          <div className="px-5 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Name</label>
                <input className={inputClass} value={newRole.name} onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))} placeholder="e.g. moderator" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Description</label>
                <input className={inputClass} value={newRole.description} onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))} placeholder="What this role can do" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#64748b] uppercase tracking-wide mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={newRole.color} onChange={e => setNewRole(r => ({ ...r, color: e.target.value }))} className="w-9 h-9 rounded cursor-pointer border border-[#e2e8f0]" />
                  <input className={inputClass} value={newRole.color} onChange={e => setNewRole(r => ({ ...r, color: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={createRole} disabled={saving || !newRole.name} className="px-4 py-1.5 text-xs rounded-lg bg-[#0c1f4a] text-white disabled:opacity-50">
                {saving ? 'Creating…' : 'Create Role'}
              </button>
              <button onClick={() => setAddingRole(false)} className="px-4 py-1.5 text-xs rounded-lg border border-[#e2e8f0] text-[#64748b]">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-[#f1f5f9]">
          {localRoles.map(role => {
            const perms = localRolePerms[role.id] ?? []
            const isExpanded = expandedRole === role.id
            const isLocked = LOCKED_ROLES.includes(role.name)
            const userCount = userRoles.filter(ur => ur.role_id === role.id).length

            return (
              <div key={role.id}>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: role.color || '#64748b' }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0c1f4a] capitalize">{role.name}</span>
                        {isLocked && <span className="text-[10px] text-[#94a3b8] bg-[#f8fafc] px-1.5 py-0.5 rounded">system</span>}
                      </div>
                      <p className="text-xs text-[#94a3b8] mt-0.5">{role.description || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                      <Users size={11} /> {userCount} user{userCount !== 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
                      <Key size={11} /> {perms.length} permission{perms.length !== 1 ? 's' : ''}
                    </div>
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] transition-colors"
                    >
                      {isExpanded ? <><ChevronUp size={12} /> Hide</> : <><ChevronDown size={12} /> Permissions</>}
                    </button>
                    {!isLocked && (
                      <button onClick={() => deleteRole(role.id)} className="p-1.5 text-[#94a3b8] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[#f1f5f9] bg-[#f8fafc] px-5 py-4">
                    <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide mb-3">Assign Permissions</p>
                    <div className="space-y-4">
                      {Object.entries(byResource).map(([resource, permsInGroup]) => (
                        <div key={resource}>
                          <p className="text-xs font-semibold text-[#64748b] capitalize mb-2">{resource.replace('_', ' ')}</p>
                          <div className="flex flex-wrap gap-2">
                            {permsInGroup.map(p => {
                              const on = perms.includes(p.name)
                              return (
                                <button
                                  key={p.id}
                                  onClick={() => togglePermission(role.id, p.name, on)}
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                    on
                                      ? 'bg-[#0c1f4a] text-white border-[#0c1f4a]'
                                      : 'bg-white text-[#64748b] border-[#e2e8f0] hover:border-[#0c1f4a] hover:text-[#0c1f4a]'
                                  }`}
                                  title={p.description}
                                >
                                  {on && <Check size={10} />}
                                  {p.action}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* User role assignments */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#e2e8f0]">
          <Users size={16} className="text-[#0c1f4a]" />
          <h3 className="text-sm font-bold text-[#0c1f4a]">User Role Assignments</h3>
        </div>
        {userRoles.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[#94a3b8]">No role assignments yet.</div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {userRoles.map((ur, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-[#0c1f4a]">{(ur.profiles as any)?.full_name ?? 'Unknown'}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white capitalize"
                    style={{ backgroundColor: (ur.roles as any)?.color || '#64748b' }}
                  >
                    {(ur.roles as any)?.name ?? '—'}
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">
                    {new Date(ur.assigned_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root Settings Client ───────────────────────────────────────────────────

export function SettingsClient({
  roles, permissions, rolePermMap, userRoles,
}: {
  roles: Role[]
  permissions: Permission[]
  rolePermMap: Record<string, string[]>
  userRoles: UserRole[]
}) {
  const [activeTab, setActiveTab] = useState('General')
  const [settings, setSettings] = useState({
    platformName: 'Intelligente',
    tagline: 'AI-Powered Career & Degree Discovery',
    adminEmail: 'admin@intelligente.com',
    timezone: '(GMT+0100) West Africa Time',
    language: 'English',
    allowRegistrations: true,
    emailNotifications: true,
    conversationAnalytics: true,
    aiRecommendations: true,
    autoBackup: true,
    backupFrequency: 'Daily',
  })
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex gap-0 border-b border-[#e2e8f0] mb-8 overflow-x-auto">
        {GENERAL_TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0 ${
              activeTab === t ? 'text-[#0c1f4a] border-[#0c1f4a]' : 'text-[#94a3b8] border-transparent hover:text-[#0c1f4a]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'General' && (
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-2">General Settings</h3>
            {[
              { key: 'platformName', label: 'Platform Name', type: 'text' },
              { key: 'tagline', label: 'Platform Tagline', type: 'text' },
              { key: 'adminEmail', label: 'Admin Email', type: 'email' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-[#64748b] mb-1">{label}</label>
                <input className={inputClass} type={type} value={(settings as any)[key]} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1">Timezone</label>
              <select className={inputClass} value={settings.timezone} onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}>
                <option>(GMT+0100) West Africa Time</option>
                <option>(GMT+0000) UTC</option>
                <option>(GMT+0100) Central European Time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-1">Language</label>
              <select className={inputClass} value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))}>
                <option>English</option><option>French</option>
              </select>
            </div>
            <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${saved ? 'bg-green-600 text-white' : 'bg-[#0c1f4a] text-white hover:bg-[#1a3461]'} transition-colors`}>
              <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <h3 className="text-sm font-bold text-[#0c1f4a] mb-4">System Preferences</h3>
            <div className="space-y-4">
              {([
                { key: 'allowRegistrations', label: 'Allow New Registrations' },
                { key: 'emailNotifications', label: 'Email Notifications' },
                { key: 'conversationAnalytics', label: 'Conversation Analytics' },
                { key: 'aiRecommendations', label: 'AI Recommendations' },
                { key: 'autoBackup', label: 'Auto Backup' },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-[#0c1f4a]">{label}</span>
                  <Toggle checked={settings[key]} onChange={v => setSettings(s => ({ ...s, [key]: v }))} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-1 mt-2">Backup Frequency</label>
                <select className={inputClass} value={settings.backupFrequency} onChange={e => setSettings(s => ({ ...s, backupFrequency: e.target.value }))}>
                  <option>Daily</option><option>Weekly</option><option>Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Roles & Permissions' && (
        <RolesTab
          roles={roles}
          permissions={permissions}
          rolePermMap={rolePermMap}
          userRoles={userRoles}
          toast={showToast}
        />
      )}

      {!['General', 'Roles & Permissions'].includes(activeTab) && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <p className="text-sm text-[#94a3b8]">{activeTab} settings — coming soon.</p>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
