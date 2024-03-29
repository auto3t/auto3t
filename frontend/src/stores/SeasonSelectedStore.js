import { create } from "zustand";

const useSelectedSeasonStore = create ((set) => ({
    selectedSeason: null,
    setSelectedSeason: (selectedSeason) => set({ selectedSeason: selectedSeason }),
}));

export default useSelectedSeasonStore
