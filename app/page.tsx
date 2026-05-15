/**
 * Home/Dashboard page.
 */

import { requireAuth } from '@/lib/auth/guards'
import Link from 'next/link'
import NavBar from '@/components/layout/navbar'

export default async function HomePage() {
  const session = await requireAuth()
  const user = session?.user as any
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text">Welcome back, {user.name}</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage your innovation ideas and track their progress through review.
          </p>
        </div>

        {/* Action cards */}
        <div className={`grid gap-4 ${isAdmin ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <div className="bg-background rounded-lg border border-border p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-text mb-1">Submit a new idea</h2>
              <p className="text-sm text-text-muted">
                Share an innovation idea with the team for evaluation and feedback.
              </p>
            </div>
            <div className="mt-auto">
              <Link
                href="/ideas/new"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                Get started &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-background rounded-lg border border-border p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-text mb-1">My ideas</h2>
              <p className="text-sm text-text-muted">
                View your submitted ideas and follow their evaluation status.
              </p>
            </div>
            <div className="mt-auto">
              <Link
                href="/ideas"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
              >
                View ideas &rarr;
              </Link>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-background rounded-lg border border-border p-6 flex flex-col">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-text mb-1">Review queue</h2>
                <p className="text-sm text-text-muted">
                  Evaluate submitted ideas, provide scores, and make final decisions.
                </p>
              </div>
              <div className="mt-auto">
                <Link
                  href="/admin/ideas"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Open queue &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
