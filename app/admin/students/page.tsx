import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { StudentsClient } from './_client'

export default async function StudentsPage() {
  await requirePermission('students:read')
  const admin = createAdminClient()

  const [{ data: profiles }, { data: recs }] = await Promise.all([
    admin.from('profiles').select('id, full_name, created_at, role').eq('role', 'student').order('created_at', { ascending: false }),
    admin.from('recommendations').select('user_id, career_matches, created_at').order('created_at', { ascending: false }),
  ])

  // Map latest career per user
  const latestCareer: Record<string, string> = {}
  for (const r of recs ?? []) {
    if (latestCareer[r.user_id]) continue
    const matches = (r.career_matches ?? []) as { career_name: string; is_primary: boolean }[]
    const primary = matches.find(m => m.is_primary) ?? matches[0]
    if (primary) latestCareer[r.user_id] = primary.career_name
  }

  const students = (profiles ?? []).map(p => ({
    id: p.id,
    full_name: p.full_name ?? 'Unknown',
    created_at: p.created_at,
    current_career: latestCareer[p.id] ?? null,
    status: 'active' as const,
  }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Students" subtitle="Manage and monitor all registered users." />
      <div className="flex-1 overflow-y-auto p-8">
        <StudentsClient students={students} />
      </div>
    </div>
  )
}
