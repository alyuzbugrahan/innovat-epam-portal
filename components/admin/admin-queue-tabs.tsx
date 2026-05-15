'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface AdminQueueTabsProps {
  activeCount: number
  closedCount: number
}

export default function AdminQueueTabs({ activeCount, closedCount }: AdminQueueTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTab = searchParams.get('tab') ?? 'active'

  function switchTab(tab: 'active' | 'closed') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    // Reset status filter when switching tabs — it may not apply to the new tab
    params.delete('status')
    router.push(`?${params.toString()}`)
  }

  const tabs = [
    { id: 'active' as const, label: 'Active', count: activeCount },
    { id: 'closed' as const, label: 'Closed', count: closedCount },
  ]

  return (
    <div className="flex gap-1 border-b border-border mb-6">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text hover:border-border-dark',
            ].join(' ')}
          >
            {tab.label}
            <span
              className={[
                'ml-2 px-1.5 py-0.5 rounded text-xs font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'bg-surface-dark text-text-muted',
              ].join(' ')}
            >
              {tab.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
