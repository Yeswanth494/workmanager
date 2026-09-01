import { Construction } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={<Construction className="size-8" />}
        title="This module is being built next"
        description="The layout, navigation, and data contracts are already in place — this screen will be wired up in the next development stage."
      />
    </div>
  )
}
