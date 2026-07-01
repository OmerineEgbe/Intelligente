import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type Permission =
  | 'admin:access'
  | 'universities:read'  | 'universities:write'  | 'universities:delete'
  | 'units:read'         | 'units:write'         | 'units:delete'
  | 'programmes:read'    | 'programmes:write'    | 'programmes:delete'
  | 'careers:read'       | 'careers:write'
  | 'students:read'
  | 'analytics:read'
  | 'ai_engine:read'
  | 'settings:read'      | 'settings:write'
  | 'roles:manage'

/** Returns the current user ID or null if not authenticated. */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/** Check if a user has a specific permission via the DB function. */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  const admin = createAdminClient()
  const { data } = await admin.rpc('user_has_permission', {
    p_user_id: userId,
    p_permission: permission,
  })
  return data === true
}

/** Get all permission names for a user. */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin.rpc('user_permissions', { p_user_id: userId })
  return (data as string[]) ?? []
}

/** Get all role names for a user. */
export async function getUserRoles(userId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId)
  return (data ?? []).map((r: any) => r.roles?.name).filter(Boolean)
}

/**
 * Server component / route guard.
 * Redirects to /login if not authenticated, to /dashboard if missing permission.
 */
export async function requirePermission(permission: Permission): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) redirect('/login')

  const allowed = await hasPermission(userId, permission)
  if (!allowed) redirect('/dashboard')

  return userId
}

/**
 * Returns user ID if they have the permission, null otherwise.
 * Use in API routes (return 401/403 instead of redirecting).
 */
export async function checkPermission(permission: Permission): Promise<string | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null
  const allowed = await hasPermission(userId, permission)
  return allowed ? userId : null
}
