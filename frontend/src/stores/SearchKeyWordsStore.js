import { create } from "zustand";

const useSearchKeyWordStore = create((set) => ({
    keywords: [],
    deletingCategory: null,
    setKeywords: (keywords) => set({keywords}),
    setDeletingCategory: (deletingCategory) => set({deletingCategory}),
}));

export default useSearchKeyWordStore;
