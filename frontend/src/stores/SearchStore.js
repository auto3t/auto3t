import { create } from "zustand";

const useSearchStore = create((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}));

export default useSearchStore
