import { create } from 'zustand'

interface ProgressState {
  pendingJobs: number
  hadPendingJobs: boolean
  refetch: () => void
  setPendingJobs: (count: number) => void
  setRefetch: (fn: () => void) => void
  resetHadPendingJobs: () => void
  isPolling: boolean
  setIsPolling: (value: boolean) => void
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  pendingJobs: 0,
  hadPendingJobs: false,
  refetch: () => {}, // default no-op
  setPendingJobs: (count: number) => {
    const { hadPendingJobs } = get()
    if (count > 0 && !hadPendingJobs) {
      set({ pendingJobs: count, hadPendingJobs: true })
    } else {
      set({ pendingJobs: count })
    }
  },
  setRefetch: (fn) => set({ refetch: fn }),
  resetHadPendingJobs: () => set({ hadPendingJobs: false }),
  isPolling: false,
  setIsPolling: (value) => set({ isPolling: value }),
}))
