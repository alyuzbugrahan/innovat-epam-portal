import { Skeleton } from '@/components/ui/skeleton'

export default function IdeaDetailLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-background rounded-lg shadow-lg p-8 border border-border space-y-8">
          {/* Title + status badge */}
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg ml-4 shrink-0" />
          </div>

          {/* Description section */}
          <div className="border-t border-border pt-6 space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Evaluator comment section */}
          <div className="border-t border-border pt-6 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Timeline section */}
          <div className="border-t border-border pt-6 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      </main>
    </div>
  )
}
