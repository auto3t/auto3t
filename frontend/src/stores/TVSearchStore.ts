import { create } from 'zustand'
import { ShowSearchResultType } from '../pages/tv/Search'

interface TVSearchStoreInterface {
  query: string
  results: ShowSearchResultType[]
  setQuery: (query: string) => void
  setResults: (results: ShowSearchResultType[]) => void
}

const useTVSearchStore = create<TVSearchStoreInterface>((set) => ({
  query: '',
  results: [],
  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
}))

export default useTVSearchStore
