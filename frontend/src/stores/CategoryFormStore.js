import { create } from "zustand";

const useCategoryFormStore = create((set) => ({
    newCategoryName: "",
    selectedCategory: null,
    showDeleteConfirmation: false,
    setNewCategoryName: (newName) => set({ newCategoryName: newName }),
    setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    setShowDeleteConfirmation: (toShow) => set({ showDeleteConfirmation: toShow }),
}));

export default useCategoryFormStore;
