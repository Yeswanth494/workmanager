import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    setIsLoading(false)
    navigate('/login')
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-text">Set a new password</h1>
      <p className="mt-1 text-sm text-text-muted">Choose a strong password you haven't used before.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          icon={<Lock className="size-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Update password
        </Button>
      </form>
    </div>
  )
}
