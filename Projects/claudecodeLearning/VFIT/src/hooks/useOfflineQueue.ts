import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { uuid } from '@/lib/utils'

interface QueuedAction {
  id: string
  table: string
  action: 'insert'
  data: Record<string, unknown>
  timestamp: number
}

const QUEUE_KEY = 'vfit_offline_queue'

function getQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function setQueue(queue: QueuedAction[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queueSize, setQueueSize] = useState(getQueue().length)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const enqueue = useCallback((table: string, data: Record<string, unknown>) => {
    const queue = getQueue()
    queue.push({
      id: uuid(),
      table,
      action: 'insert',
      data,
      timestamp: Date.now(),
    })
    setQueue(queue)
    setQueueSize(queue.length)
  }, [])

  const syncQueue = useCallback(async () => {
    const queue = getQueue()
    if (queue.length === 0 || !navigator.onLine) return

    setSyncing(true)
    const failed: QueuedAction[] = []

    for (const item of queue) {
      const { error } = await supabase.from(item.table).insert(item.data)
      if (error) {
        failed.push(item)
      }
    }

    setQueue(failed)
    setQueueSize(failed.length)
    setSyncing(false)
  }, [])

  return { isOnline, queueSize, syncing, enqueue, syncQueue }
}
