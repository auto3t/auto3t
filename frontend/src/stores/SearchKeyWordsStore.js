import { create } from "zustand";

const useSearchKeyWordStore = create((set) => ({
    keywords: [],
    setKeywords: (keywords) => set({keywords}),
    createKeyword: false,
    setCreateKeyword: (isCreating) => set({ createKeyword: isCreating }),
    deletingKeyword: null,
    setDeletingKeyword: (keyword) => set({deletingKeyword: keyword}),
    editingKeyword: null,
    setEditingKeyword: (newEditingKeyword) => set({editingKeyword: newEditingKeyword}),
    newKeyword: "",
    setNewKeyword: (newKeywordName) => set({ newKeyword: newKeywordName }),
    selectedCategory: "",
    setSelectedCategory: (newSelectedCategory) => set({ selectedCategory: newSelectedCategory }),
    direction: "i",
    setDirection: (newDirection) => set({ direction: newDirection }),
    isDefaultTV: false,
    setIsDefaultTV: (newDefaultTV) => set({isDefaultTV: newDefaultTV}),
    isDefaultMovie: false,
    setIsDefaultMovie: (newDefaultMovie) => set({isDefaultMovie: newDefaultMovie}),
}));

export default useSearchKeyWordStore;
