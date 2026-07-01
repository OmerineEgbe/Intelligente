// Academic units (schools, faculties, departments, colleges, institutes, centres)
// Private: school (parent_id = null) → programme
// Government: faculty (parent_id = null) → department (parent_id = faculty_id) → programme

import { createAdminClient } from '@/lib/supabase/admin'
import { checkPermission } from '@/lib/auth/permissions'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const userId = await checkPermission('units:write')
  return userId ? { id: userId } : null
}

export async function GET(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const universityId = searchParams.get('university_id')

  const admin = createAdminClient()
  let query = admin
    .from('schools')
    .select('*, parent:parent_id(id, name, unit_type)')
    .order('name')

  if (universityId) query = query.eq('university_id', universityId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ units: data })
}

export async function POST(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { university_id, name, unit_type, parent_id, description } = body

  if (!university_id || !name || !unit_type) {
    return NextResponse.json({ error: 'university_id, name, and unit_type are required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('schools')
    .insert({ university_id, name, unit_type, parent_id: parent_id || null, description })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unit: data })
}

export async function PATCH(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('schools')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ unit: data })
}

export async function DELETE(req: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('schools').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
