import { clsx } from 'clsx'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            'relative px-4 py-2.5 text-sm font-medium transition-colors',
            active === tab.key ? 'text-ink-800' : 'text-text-muted hover:text-text',
          )}
        >
          {tab.label}
          {active === tab.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent-500" />}
        </button>
      ))}
    </div>
  )
}
