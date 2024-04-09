import { create } from "zustand";

const useSearchKeyWordStore = create((set) => ({
    keywords: [],
    categories: [],
    newCategoryName: "",
    deletingCategory: null,
    setKeywords: (keywords) => set({keywords}),
    setCategories: (categories) => set({categories}),
    setNewCategoryName: (newName) => set({ newCategoryName: newName }),
    setDeletingCategory: (deletingCategory) => set({deletingCategory}),
}));

export default useSearchKeyWordStore;
