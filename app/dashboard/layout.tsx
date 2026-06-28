import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { GuidanceModeWidget } from '@/components/chat/GuidanceModeWidget'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userName = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Student'
  const userEmail = user.email ?? ''

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <DashboardSidebar userName={userName} userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
      <GuidanceModeWidget />
    </div>
  )
}
