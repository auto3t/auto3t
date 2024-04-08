import { create } from "zustand";

const useSearchKeyWordStore = create((set) => ({
    keywords: [],
    categories: [],
    setKeywords: (keywords) => set({keywords}),
    setCategories: (categories) => set({categories}),
}));

export default useSearchKeyWordStore;
