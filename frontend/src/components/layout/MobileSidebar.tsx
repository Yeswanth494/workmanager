import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} />
      <div className="relative">
        <Sidebar />
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-4 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  )
}
