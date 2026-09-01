import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function Unauthorized() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="size-10 text-warning-600" />
      <h1 className="mt-4 font-display text-3xl font-semibold text-text">Access restricted</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        You don't have permission to view this page. Contact an administrator if you think this is a mistake.
      </p>
      <Link to="/app/dashboard" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
