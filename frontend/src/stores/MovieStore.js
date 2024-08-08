import { create } from 'zustand'

const useMovieStore = create((set) => ({
  movies: [],
  setMovies: (movies) => set({ movies }),
}));

export default useMovieStore;
