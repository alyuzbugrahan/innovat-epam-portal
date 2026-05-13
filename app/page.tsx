/**
 * Home/Dashboard page.
 */

import { requireAuth } from '@/lib/auth/guards'
import Link from 'next/link'
import { signOut } from '@/lib/auth/auth'

export default async function HomePage() {
  const session = await requireAuth()
  const user = session?.user as any

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-text">InnovatEPAM Portal</h1>
              <p className="text-sm text-text-muted">Welcome, {user.name}!</p>
            </div>
            <div className="flex gap-4 items-center">
              {user.role === 'ADMIN' && (
                <Link href="/admin/ideas" className="text-primary hover:text-primary-dark font-medium">
                  Admin Queue
                </Link>
              )}
              <Link href="/ideas" className="text-primary hover:text-primary-dark font-medium">
                My Ideas
              </Link>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/login' })
                }}
              >
                <button
                  type="submit"
                  className="bg-error text-white px-4 py-2 rounded-lg hover:bg-error-dark transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Welcome Card */}
          <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-text mb-4">Welcome to InnovatEPAM Portal</h2>
            <p className="text-text-muted mb-6">
              Share your innovation ideas with the team. Admins will evaluate your submissions and provide feedback.
            </p>
            <Link
              href="/ideas/new"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Submit New Idea
            </Link>
          </div>

          {/* Info Card */}
          <div className="bg-background rounded-lg shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-text mb-4">Your Ideas</h2>
            <p className="text-text-muted mb-6">
              View all your submitted ideas and their evaluation status. You'll receive updates as admins review them.
            </p>
            <Link
              href="/ideas"
              className="inline-block bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary-dark transition-colors font-medium"
            >
              View My Ideas
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-12 bg-background rounded-lg shadow-lg p-8 border border-border">
          <h2 className="text-2xl font-bold text-text mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1</div>
              <h3 className="font-bold text-text mb-2">Submit</h3>
              <p className="text-text-muted text-sm">Share your idea with a title, description, and optional file.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <h3 className="font-bold text-text mb-2">Review</h3>
              <p className="text-text-muted text-sm">Admins evaluate your idea and provide constructive feedback.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <h3 className="font-bold text-text mb-2">Track</h3>
              <p className="text-text-muted text-sm">See the status and comments on your idea in real-time.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
