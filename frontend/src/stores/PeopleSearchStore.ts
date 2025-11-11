import { create } from 'zustand'
import { PersonSearchResultType } from '../pages/people/Search'

interface PeoleSearchState {
  moviePersonResults: null | PersonSearchResultType[]
  setMoviePersonResults: (persons: PersonSearchResultType[]) => void
  tvPersonResults: null | PersonSearchResultType[]
  setTVPersonResults: (persons: PersonSearchResultType[]) => void
  selectedMoviePerson: null | PersonSearchResultType
  setSelectedMoviePerson: (person: PersonSearchResultType | null) => void
  selectedTVPerson: null | PersonSearchResultType
  setSelectedTVPerson: (person: PersonSearchResultType | null) => void
}

const usePeopleSearchStore = create<PeoleSearchState>((set) => ({
  moviePersonResults: null,
  setMoviePersonResults: (persons) => set({ moviePersonResults: persons }),
  tvPersonResults: null,
  setTVPersonResults: (persons) => set({ tvPersonResults: persons }),
  selectedMoviePerson: null,
  setSelectedMoviePerson: (person) => set({ selectedMoviePerson: person }),
  selectedTVPerson: null,
  setSelectedTVPerson: (person) => set({ selectedTVPerson: person }),
}))

export default usePeopleSearchStore
