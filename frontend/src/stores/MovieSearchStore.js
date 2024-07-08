import { create } from "zustand";

const useMovieSearchStore = create((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}));

export default useMovieSearchStore
