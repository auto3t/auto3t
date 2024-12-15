import { create } from "zustand";
import { MovieSearchResultType } from "../pages/movie/Search";

interface MovieSearchStoreInterface {
  query: string;
  results: MovieSearchResultType[] | null;
  setQuery: (query: string) => void;
  setResults: (reqults: MovieSearchResultType[]) => void;
}

const useMovieSearchStore = create<MovieSearchStoreInterface>((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}));

export default useMovieSearchStore
