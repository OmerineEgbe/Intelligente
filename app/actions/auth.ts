'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function createProfile(userId: string, fullName: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    full_name: fullName,
    role: 'student',
  })
  if (error) throw new Error(error.message)
}
