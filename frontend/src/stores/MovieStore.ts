import { create } from 'zustand'
import { MovieType } from '../pages/movie/MovieDetails';

interface MovieStoreInterface {
  movies: MovieType[];
  setMovies: (movies: MovieType[]) => void;
}

const useMovieStore = create<MovieStoreInterface>((set) => ({
  movies: [],
  setMovies: (movies) => set({ movies }),
}));

export default useMovieStore;
