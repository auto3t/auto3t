import { create } from 'zustand'
import { KeyWordCategoryType } from '../components/KeywordCategories'

interface CategoryFormStoreInterface {
  categories: KeyWordCategoryType[]
  setCategories: (categories: KeyWordCategoryType[]) => void
  createCategory: boolean
  setCreateCategory: (isCreating: boolean) => void
  newCategoryName: string
  setNewCategoryName: (newName: string) => void
  deletingCategory: KeyWordCategoryType | null
  setDeletingCategory: (deletingCategory: KeyWordCategoryType | null) => void
  editingCategory: KeyWordCategoryType | null
  setEditingCategory: (editingCategory: KeyWordCategoryType | null) => void
  editedCategoryName: string
  setEditedCategoryName: (editingName: string) => void
}

const useCategoryFormStore = create<CategoryFormStoreInterface>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  createCategory: false,
  setCreateCategory: (isCreating) => set({ createCategory: isCreating }),
  newCategoryName: '',
  setNewCategoryName: (newName) => set({ newCategoryName: newName }),
  deletingCategory: null,
  setDeletingCategory: (deletingCategory) => set({ deletingCategory }),
  editingCategory: null,
  setEditingCategory: (editingCategory) => set({ editingCategory }),
  editedCategoryName: '',
  setEditedCategoryName: (editingName) =>
    set({ editedCategoryName: editingName }),
}))

export default useCategoryFormStore
