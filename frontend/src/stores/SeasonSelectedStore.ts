import { create } from 'zustand'
import { SeasonType } from '../components/tv/Season'

interface SelectedSeason {
  selectedSeason: SeasonType | null
  showAllSeasons: boolean
  setSelectedSeason: (selectedSeason: SeasonType) => void
  setShowAllSeasons: (showAllSeasons: boolean) => void
}

const useSelectedSeasonStore = create<SelectedSeason>((set) => ({
  selectedSeason: null,
  showAllSeasons: false,
  setSelectedSeason: (selectedSeason) =>
    set({ selectedSeason: selectedSeason }),
  setShowAllSeasons: (showAllSeasons) =>
    set({ showAllSeasons: showAllSeasons }),
}))

export default useSelectedSeasonStore
