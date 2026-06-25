'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import { BrainCircuit, Eye, EyeOff } from 'lucide-react'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'sign-up') {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split('@')[0],
        })
        if (res.error) throw new Error(res.error.message)
      } else {
        const res = await authClient.signIn.email({ email, password })
        if (res.error) throw new Error(res.error.message)
      }
      router.push(mode === 'sign-up' ? '/welcome' : '/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Left panel — navy brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c1f4a] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">Intelligente</span>
        </div>

        <div>
          <blockquote className="text-white/80 text-lg leading-relaxed mb-4">
            &ldquo;Intelligente helped me discover that I was perfectly suited for Data Science — something I never would have considered on my own.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div>
              <p className="text-white text-sm font-medium">Amara Nwosu</p>
              <p className="text-white/50 text-xs">MSc Data Science, LMUI</p>
            </div>
          </div>
        </div>

        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} Landmark Metropolitan University Institute
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#0c1f4a] flex items-center justify-center">
              <BrainCircuit size={15} className="text-white" />
            </div>
            <span className="font-bold text-[#0c1f4a]">Intelligente</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#0c1f4a] mb-1">
                {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-sm text-[#64748b]">
                {mode === 'sign-in'
                  ? 'Sign in to continue your guidance journey'
                  : 'Start your personalised career guidance journey'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'sign-up' && (
                <div>
                  <label className="block text-sm font-medium text-[#0c1f4a] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#0c1f4a] placeholder-[#94a3b8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#0c1f4a] mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#0c1f4a] placeholder-[#94a3b8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0c1f4a] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-[#0c1f4a] placeholder-[#94a3b8] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'sign-up' && (
                  <p className="text-xs text-[#94a3b8] mt-1">Minimum 8 characters</p>
                )}
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#0c1f4a] text-white font-medium text-sm hover:bg-[#1a3461] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? mode === 'sign-in' ? 'Signing in…' : 'Creating account…'
                  : mode === 'sign-in' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-[#64748b] mt-6">
              {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
              <Link
                href={mode === 'sign-in' ? '/sign-up' : '/sign-in'}
                className="text-[#1a3461] font-medium hover:underline"
              >
                {mode === 'sign-in' ? 'Create one' : 'Sign in'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
