import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { SettingsClient } from './_client'

export default async function SettingsPage() {
  await requirePermission('settings:read')
  const admin = createAdminClient()

  const [{ data: roles }, { data: permissions }, { data: userRoles }, { data: rolePerms }] = await Promise.all([
    admin.from('roles').select('*').order('name'),
    admin.from('permissions').select('*').order('resource').order('action'),
    admin.from('user_roles').select('user_id, role_id, assigned_at, roles(id, name, color), profiles:user_id(full_name)'),
    admin.from('role_permissions').select('role_id, permissions(name)'),
  ])

  // Build role → permission names map
  const rolePermMap: Record<string, string[]> = {}
  for (const rp of rolePerms ?? []) {
    const rid = rp.role_id
    const pname = (rp.permissions as any)?.name
    if (!rolePermMap[rid]) rolePermMap[rid] = []
    if (pname) rolePermMap[rid].push(pname)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Settings" subtitle="Manage system settings, roles, and permissions." />
      <div className="flex-1 overflow-y-auto p-8">
        <SettingsClient
          roles={roles ?? []}
          permissions={permissions ?? []}
          rolePermMap={rolePermMap}
          userRoles={(userRoles ?? []) as any[]}
        />
      </div>
    </div>
  )
}
