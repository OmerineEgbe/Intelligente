import { createAdminClient } from '@/lib/supabase/admin'
import { checkPermission } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

async function guard() {
  const userId = await checkPermission('roles:manage')
  return userId ? { id: userId } : null
}

export async function GET() {
  const user = await guard()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin.from('roles').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ roles: data })
}

export async function POST(req: Request) {
  const user = await guard()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, color } = await req.json()
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('roles')
    .insert({ name: name.toLowerCase().trim(), description, color: color || '#64748b' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ role: data })
}

export async function PATCH(req: Request) {
  const user = await guard()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ...fields } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.from('roles').update(fields).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ role: data })
}

export async function DELETE(req: Request) {
  const user = await guard()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminClient()
  // Prevent deleting system roles
  const { data: role } = await admin.from('roles').select('name').eq('id', id).single()
  if (['admin', 'student'].includes(role?.name ?? '')) {
    return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 400 })
  }

  const { error } = await admin.from('roles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
