import { STATUS_LABELS } from '@/lib/utils/status'

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border border-slate-200',
  SUBMITTED: 'bg-blue-50 text-blue-700 border border-blue-200',
  INITIAL_SCREENING: 'bg-amber-50 text-amber-700 border border-amber-200',
  TECHNICAL_REVIEW: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  BUSINESS_REVIEW: 'bg-violet-50 text-violet-700 border border-violet-200',
  ACCEPTED: 'bg-green-50 text-green-700 border border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
}

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 border border-slate-200'
  const sizeClass = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${style}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
