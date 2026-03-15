import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { OfflineIndicator } from '@/components/ui/OfflineIndicator'

export function AppShell() {
  return (
    <div className="min-h-full flex flex-col bg-bg">
      <OfflineIndicator />
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
