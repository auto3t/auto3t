import { create } from "zustand";

const useBulkUpdateStore = create((set) => ({
    status: null,
    setStatus: (newStatus) => set({ status: newStatus }),
}));

export default useBulkUpdateStore;
