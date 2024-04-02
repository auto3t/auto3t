import { create } from "zustand";

const useBulkUpdateStore = create((set) => ({
    status: '',
    setStatus: (newStatus) => set({ status: newStatus }),
}));

export default useBulkUpdateStore;
