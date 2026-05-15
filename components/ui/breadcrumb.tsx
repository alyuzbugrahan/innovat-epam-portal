import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-text-muted mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && <span>/</span>}
            {isLast || !item.href ? (
              <span className={isLast ? 'text-text font-medium' : undefined}>{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-text transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
