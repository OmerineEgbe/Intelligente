import { AuthForm } from '@/components/auth-form'

export const metadata = {
  title: 'Create Account | Intelligente',
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
