import { create } from "zustand";

const useSearchKeyWordStore = create((set) => ({
    keywords: [],
    setKeywords: (keywords) => set({keywords}),
    deletingKeyword: null,
    setDeletingKeyword: (keyword) => set({deletingKeyword: keyword}),
    newKeyword: "",
    setNewKeyword: (newKeywordName) => set({ newKeyword: newKeywordName }),
    selectedCategory: "",
    setSelectedCategory: (newSelectedCategory) => set({ selectedCategory: newSelectedCategory }),
    direction: "i",
    setDirection: (newDirection) => set({ direction: newDirection }),
    isDefault: false,
    setIsDefault: (newDefault) => set({ isDefault: newDefault }),
}));

export default useSearchKeyWordStore;
