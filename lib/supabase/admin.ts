import { createClient } from '@supabase/supabase-js'

// Uses the service role key — bypasses RLS.
// Import this ONLY in server files (API routes, server actions). Never in client components.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
