import { createAdminClient } from '@/lib/supabase/admin'
import { checkPermission } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const userId = await checkPermission('programmes:write')
  return userId ? { id: userId } : null
}

export async function GET(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const schoolId = searchParams.get('school_id')
  const universityId = searchParams.get('university_id')

  const admin = createAdminClient()
  let query = admin
    .from('programmes')
    .select('*, school:school_id(id, name, unit_type, university_id, universities(name, short_name))')
    .order('name')

  if (schoolId) query = query.eq('school_id', schoolId)
  if (universityId) {
    // filter by university via schools join
    const { data: schools } = await admin.from('schools').select('id').eq('university_id', universityId)
    const ids = (schools ?? []).map((s: { id: string }) => s.id)
    if (ids.length) query = query.in('school_id', ids)
    else return NextResponse.json({ programmes: [] })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ programmes: data })
}

export async function POST(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { school_id, name, qualification, duration, degree_field, entry_requirements, level, mode, description, tuition_fee, status } = body

  if (!school_id || !name || !qualification) {
    return NextResponse.json({ error: 'school_id, name, and qualification are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('programmes')
    .insert({
      school_id,
      name,
      qualification,
      duration: duration || null,
      degree_field: degree_field || null,
      entry_requirements: entry_requirements || null,
      level: level || 'undergraduate',
      mode: mode || 'full-time',
      description: description || null,
      tuition_fee: tuition_fee || null,
      status: status || 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ programme: data })
}

export async function PATCH(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('programmes')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ programme: data })
}

export async function DELETE(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('programmes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
