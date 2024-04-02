import { create } from "zustand";

const useSelectedSeasonStore = create((set) => ({
  selectedSeason: null,
  showAllSeasons: false,
  setSelectedSeason: (selectedSeason) => set({ selectedSeason: selectedSeason }),
  setShowAllSeasons: (showAllSeasons) => set({ showAllSeasons: showAllSeasons }),
}));

export default useSelectedSeasonStore;
