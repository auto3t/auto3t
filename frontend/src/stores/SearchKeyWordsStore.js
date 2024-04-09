import { create } from "zustand";

const useSearchKeyWordStore = create((set) => ({
    keywords: [],
    setKeywords: (keywords) => set({keywords}),
    newKeyword: "",
    setNewKeyword: (newKeywordName) => set({ newKeyword: newKeywordName }),
    selectedCategory: "",
    setSelectedCategory: (newSelectedCategory) => set({ selectedCategory: newSelectedCategory }),
    direction: "include",
    setDirection: (newDirection) => set({ direction: newDirection }),
    isDefault: false,
    setIsDefault: (newDefault) => set({ isDefault: newDefault }),
}));

export default useSearchKeyWordStore;
