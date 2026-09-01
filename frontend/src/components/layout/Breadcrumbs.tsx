import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean).filter((s) => s !== 'app')

  return (
    <div className="flex items-center gap-1.5 text-xs text-text-muted">
      <Link to="/app/dashboard" className="hover:text-text">
        Home
      </Link>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="size-3" />
          <span className="capitalize">{seg}</span>
        </span>
      ))}
    </div>
  )
}
