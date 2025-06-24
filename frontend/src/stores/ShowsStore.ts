import { create } from 'zustand'
import { ShowType } from '../components/tv/ShowDetail'

interface TVShowStoreInterface {
  shows: ShowType[]
  setShows: (shows: ShowType[]) => void
}

const useTVShowsStore = create<TVShowStoreInterface>((set) => ({
  shows: [],
  setShows: (shows) => set({ shows }),
}))

export default useTVShowsStore
