import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await register(form)
      navigate('/login', {
        replace: true,
        state: { registered: true },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Create your account</h1>
      <p className="mt-1 text-sm text-text-muted">Start managing your team on WorkSphere.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="Full name"
          icon={<User className="size-4" />}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Jordan Lee"
          required
        />
        <Input
          label="Email"
          type="email"
          icon={<Mail className="size-4" />}
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@company.com"
          required
        />
        <Input
          label="Password"
          type="password"
          icon={<Lock className="size-4" />}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="At least 8 characters"
          minLength={8}
          required
        />

        {error && <p className="text-sm text-danger-600">{error}</p>}

        <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
