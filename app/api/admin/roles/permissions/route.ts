import { createAdminClient } from '@/lib/supabase/admin'
import { checkPermission } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

async function guard() {
  const userId = await checkPermission('roles:manage')
  return userId ? { id: userId } : null
}

// POST: grant a permission to a role
export async function POST(req: Request) {
  const user = await guard()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role_id, permission_name } = await req.json()
  if (!role_id || !permission_name) {
    return NextResponse.json({ error: 'role_id and permission_name are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: perm } = await admin.from('permissions').select('id').eq('name', permission_name).single()
  if (!perm) return NextResponse.json({ error: 'Permission not found' }, { status: 404 })

  const { error } = await admin
    .from('role_permissions')
    .insert({ role_id, permission_id: perm.id })

  if (error && !error.message.includes('duplicate')) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

// DELETE: revoke a permission from a role
export async function DELETE(req: Request) {
  const user = await guard()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role_id, permission_name } = await req.json()
  if (!role_id || !permission_name) {
    return NextResponse.json({ error: 'role_id and permission_name are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: perm } = await admin.from('permissions').select('id').eq('name', permission_name).single()
  if (!perm) return NextResponse.json({ error: 'Permission not found' }, { status: 404 })

  const { error } = await admin
    .from('role_permissions')
    .delete()
    .eq('role_id', role_id)
    .eq('permission_id', perm.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
