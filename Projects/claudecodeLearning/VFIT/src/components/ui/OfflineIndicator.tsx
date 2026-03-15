import { WifiOff, RefreshCw } from 'lucide-react'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

export function OfflineIndicator() {
  const { isOnline, queueSize, syncing, syncQueue } = useOfflineQueue()

  if (isOnline && queueSize === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div className={`mx-3 mt-2 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-medium ${
        isOnline ? 'glass border-accent/20 text-accent' : 'bg-warning-muted border border-warning/20 text-warning'
      }`}>
        {!isOnline && (
          <>
            <WifiOff size={16} />
            <span className="flex-1">Offline — changes will sync when connected</span>
            {queueSize > 0 && (
              <span className="text-xs bg-warning/20 px-2 py-0.5 rounded-full">{queueSize}</span>
            )}
          </>
        )}
        {isOnline && queueSize > 0 && (
          <>
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span className="flex-1">Syncing {queueSize} pending changes...</span>
            {!syncing && (
              <button onClick={syncQueue} className="text-xs underline cursor-pointer">Retry</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
