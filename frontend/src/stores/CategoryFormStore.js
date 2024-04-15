import { create } from "zustand";

const useCategoryFormStore = create((set) => ({
    categories: [],
    setCategories: (categories) => set({categories}),
    createCategory: false,
    setCreateCategory: (isCreating) => set({ createCategory: isCreating}),
    newCategoryName: "",
    setNewCategoryName: (newName) => set({ newCategoryName: newName }),
    deletingCategory: null,
    setDeletingCategory: (deletingCategory) => set({deletingCategory}),
    editingCategory: null,
    setEditingCategory: (editingCategory) => set({editingCategory}),
    editedCategoryName: "",
    setEditedCategoryName: (editingName) => set({editedCategoryName: editingName}),
}))

export default useCategoryFormStore;
