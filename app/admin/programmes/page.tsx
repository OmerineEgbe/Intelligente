import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { ProgrammesClient } from './_client'

export default async function ProgrammesPage() {
  await requirePermission('programmes:read')
  const admin = createAdminClient()

  const [{ data: programmes }, { data: universities }] = await Promise.all([
    admin
      .from('programmes')
      .select('*, school:school_id(id, name, unit_type, university_id, universities(name, short_name))')
      .order('name'),
    admin.from('universities').select('id, name, short_name, institution_type').order('name'),
  ])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Programmes" subtitle="Manage all academic programmes in the system." />
      <div className="flex-1 overflow-y-auto p-8">
        <ProgrammesClient
          initialProgrammes={programmes ?? []}
          universities={universities ?? []}
        />
      </div>
    </div>
  )
}
