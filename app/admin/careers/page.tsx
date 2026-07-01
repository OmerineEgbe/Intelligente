import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/permissions'
import { AdminHeader } from '../_components/AdminHeader'
import { CareersClient } from './_client'

export default async function CareersPage() {
  await requirePermission('careers:read')
  const admin = createAdminClient()

  const { data: recs } = await admin
    .from('recommendations')
    .select('career_matches, degree_field')

  // Aggregate career data from recommendations
  const careerMap = new Map<string, { count: number; degreeFields: Set<string>; description: string }>()

  for (const rec of recs ?? []) {
    const matches = (rec.career_matches ?? []) as {
      career_name: string
      description?: string
      is_primary: boolean
      match_score?: number
    }[]
    for (const m of matches) {
      if (!m.career_name) continue
      const existing = careerMap.get(m.career_name)
      if (existing) {
        existing.count++
        if (rec.degree_field) existing.degreeFields.add(rec.degree_field)
      } else {
        careerMap.set(m.career_name, {
          count: 1,
          degreeFields: new Set(rec.degree_field ? [rec.degree_field] : []),
          description: m.description ?? '',
        })
      }
    }
  }

  const careers = Array.from(careerMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, data]) => ({
      name,
      mapped_degrees: data.degreeFields.size,
      description: data.description,
      recommendation_count: data.count,
      status: 'active',
    }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AdminHeader title="Careers" subtitle="Manage career database and mappings." />
      <div className="flex-1 overflow-y-auto p-8">
        <CareersClient careers={careers} />
      </div>
    </div>
  )
}
