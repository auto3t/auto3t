import { create } from "zustand";

const useTVSearchStore = create((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}));

export default useTVSearchStore
