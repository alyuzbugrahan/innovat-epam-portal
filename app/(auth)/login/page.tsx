/**
 * Login page.
 */

'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="w-full max-w-sm px-4">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-primary">Innovat</span>
            <span className="text-2xl font-bold text-text">EPAM</span>
          </div>
          <p className="text-sm text-text-muted">Innovation Portal</p>
        </div>

        <div className="bg-background rounded-xl border border-border p-8">
          <h1 className="text-lg font-semibold text-text mb-6">Sign in to your account</h1>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                disabled={loading}
                autoComplete="email"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-dark"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                disabled={loading}
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-surface-dark"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-medium py-2 px-4 rounded-lg text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-text-muted text-sm">
            Don’t have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
