import Link from 'next/link'
import { getSession } from '@/lib/auth/guards'
import { signOutAction } from '@/lib/auth/actions'

export default async function NavBar() {
  const session = await getSession()
  const user = session?.user as { name?: string; role?: string } | undefined

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center group">
            <span className="text-sm font-bold text-primary group-hover:text-primary-dark transition-colors">
              Innovat
            </span>
            <span className="text-sm font-bold text-text">EPAM</span>
            <span className="ml-2 text-xs text-text-muted font-normal hidden sm:inline">
              Portal
            </span>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="flex items-center gap-1" aria-label="Main navigation">
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin/ideas"
                  className="text-sm px-3 py-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-dark transition-colors"
                >
                  Admin Queue
                </Link>
              )}
              <Link
                href="/ideas"
                className="text-sm px-3 py-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-dark transition-colors"
              >
                My Ideas
              </Link>
              <div className="ml-2 pl-3 border-l border-border flex items-center gap-2">
                <span className="text-sm text-text-muted hidden md:inline truncate max-w-[140px]">
                  {user.name}
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-sm px-3 py-1.5 rounded-md text-text-muted hover:text-text hover:bg-surface-dark transition-colors"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
