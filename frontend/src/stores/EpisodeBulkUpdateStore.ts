import { create } from 'zustand'

interface BulkUpdateStoreInterface {
  status: string | null
  setStatus: (arg0: string) => void
}

const useBulkUpdateStore = create<BulkUpdateStoreInterface>((set) => ({
  status: null,
  setStatus: (newStatus) => set({ status: newStatus }),
}))

export default useBulkUpdateStore
