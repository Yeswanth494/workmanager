import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm text-accent-600">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-text">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/app/dashboard" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
