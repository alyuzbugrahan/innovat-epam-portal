import { Skeleton } from '@/components/ui/skeleton'
import NavBar from '@/components/layout/navbar'

export default function AdminIdeasLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <NavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-1.5 mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="bg-background rounded-lg border border-border overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-b-0"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
