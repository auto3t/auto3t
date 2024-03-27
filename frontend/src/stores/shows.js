import { create } from 'zustand'

const useTVShowsStore = create((set) => ({
  shows: [],
  setShows: (shows) => set({ shows }),
}));

export default useTVShowsStore;
