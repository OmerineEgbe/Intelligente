import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Create Account — Intelligente',
  description: 'Create your Intelligente guidance account',
}

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')

  return <AuthForm mode="sign-up" />
}
