import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/authService'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    await authService.requestPasswordReset(email)
    setIsLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-text">Check your inbox</h1>
        <p className="mt-2 text-sm text-text-muted">
          If an account exists for <span className="font-medium text-text">{email}</span>, we've sent a link to reset your password.
        </p>
        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:underline">
          <ArrowLeft className="size-4" /> Back to login
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Reset your password</h1>
      <p className="mt-1 text-sm text-text-muted">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          icon={<Mail className="size-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Send reset link
        </Button>
      </form>

      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:underline">
        <ArrowLeft className="size-4" /> Back to login
      </Link>
    </div>
  )
}
