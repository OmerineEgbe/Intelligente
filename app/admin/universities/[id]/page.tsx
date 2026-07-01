import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../../_components/AdminHeader'
import { UniversityManageClient } from './_client'
import { notFound } from 'next/navigation'

export default async function UniversityManagePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('universities:read')
  const { id } = await params
  const admin = createAdminClient()

  const [{ data: university }, { data: units }, { data: programmes }] = await Promise.all([
    admin.from('universities').select('*').eq('id', id).single(),
    admin.from('schools').select('*, parent:parent_id(id, name, unit_type)').eq('university_id', id).order('name'),
    admin
      .from('programmes')
      .select('*, school:school_id(id, name, unit_type)')
      .in(
        'school_id',
        // sub-select school ids for this university — done in app layer
        (await admin.from('schools').select('id').eq('university_id', id)).data?.map((s: { id: string }) => s.id) ?? ['']
      )
      .order('name'),
  ])

  if (!university) notFound()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader
        title={university.short_name}
        subtitle={university.name}
        backHref="/admin/universities"
        backLabel="Universities"
      />
      <div className="flex-1 overflow-y-auto p-8">
        <UniversityManageClient
          university={university}
          initialUnits={units ?? []}
          initialProgrammes={programmes ?? []}
        />
      </div>
    </div>
  )
}
