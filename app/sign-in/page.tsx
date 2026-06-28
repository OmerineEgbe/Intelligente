import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Sign In | Intelligente',
}

export default function SignInPage() {
  return <AuthForm mode="sign-in" />
}
