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
    isDefault: false,
    setIsDefault: (newDefault) => set({ isDefault: newDefault }),
    appliesToMovie: false,
    setAppliesToMovie: (newAppliesToMovie => set({ appliesToMovie: newAppliesToMovie })),
    appliesToTv: false,
    setAppliesToTv: (newAppliesToTV => set({ appliesToTv: newAppliesToTV })),
}));

export default useSearchKeyWordStore;
