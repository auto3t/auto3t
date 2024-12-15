import { create } from "zustand";
import { KeywordType } from "../components/Keywords";

interface SearchKeyWordStoreInterface {
  keywords: KeywordType[];
  setKeywords: (keywords: KeywordType[]) => void;
  createKeyword: boolean;
  setCreateKeyword: (isCreating: boolean) => void;
  deletingKeyword: KeywordType | null;
  setDeletingKeyword: (keyword: KeywordType | null) => void;
  editingKeyword: KeywordType | null;
  setEditingKeyword: (newKeywordName: KeywordType | null) => void;
  newKeyword: string;
  setNewKeyword: (newKeywordName: string) => void;
  selectedCategory: string;
  setSelectedCategory: (newSelectedCategory: string) => void;
  direction: string;
  setDirection: (newDirection: string) => void;
  isDefaultTV: boolean;
  setIsDefaultTV: (newDefaultTV: boolean) => void;
  isDefaultMovie: boolean;
  setIsDefaultMovie: (newDefaultMovie: boolean) => void;
}

const useSearchKeyWordStore = create<SearchKeyWordStoreInterface>((set) => ({
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
