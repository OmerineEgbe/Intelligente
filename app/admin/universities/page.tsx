import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { UniversitiesClient } from './_client'

export default async function UniversitiesPage() {
  await requirePermission('universities:read')
  const admin = createAdminClient()

  const { data: universities } = await admin
    .from('universities')
    .select('*, schools(id), programmes:schools(programmes(id))')
    .order('name')

  // Flatten counts
  const uniData = (universities ?? []).map(u => ({
    id: u.id,
    name: u.name,
    short_name: u.short_name,
    institution_type: u.institution_type ?? 'private',
    country: u.country,
    city: u.city ?? '',
    website: u.website ?? '',
    description: u.description ?? '',
    status: u.status,
    created_at: u.created_at,
    school_count: (u.schools ?? []).length,
  }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Universities" subtitle="Manage partner universities and their settings." />
      <div className="flex-1 overflow-y-auto p-8">
        <UniversitiesClient initialData={uniData} />
      </div>
    </div>
  )
}
