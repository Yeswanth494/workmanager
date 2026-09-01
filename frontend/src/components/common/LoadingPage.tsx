import { Spinner } from '@/components/ui/Spinner'

export function LoadingPage() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner className="size-8" />
    </div>
  )
}
