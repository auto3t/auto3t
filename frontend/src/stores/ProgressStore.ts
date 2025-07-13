import { create } from 'zustand'

interface ProgressStore {
  pendingJobs: number
  isProcessing: boolean

  setPendingJobs: (count: number) => void
  registerRefreshCallback: (fn: () => void) => void
  unregisterRefreshCallback: (fn: () => void) => void
  startPolling: () => void
  stopPolling: () => void
}

export const useProgressStore = create<ProgressStore>((set, get) => {
  let interval: NodeJS.Timeout | null = null
  const callbacks = new Set<() => void>()

  return {
    pendingJobs: 0,
    isProcessing: false,

    setPendingJobs: (count) => {
      set({
        pendingJobs: count,
        isProcessing: count > 0,
      })

      if (count > 0) {
        callbacks.forEach((cb) => cb())
      }
    },

    registerRefreshCallback: (fn) => {
      callbacks.add(fn)
    },

    unregisterRefreshCallback: (fn) => {
      callbacks.delete(fn)
    },

    startPolling: () => {
      if (interval) clearInterval(interval)

      const delay = get().isProcessing ? 10000 : 60000

      interval = setInterval(() => {
        window.dispatchEvent(new Event('progress:poll'))
      }, delay)
    },

    stopPolling: () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    },
  }
})
