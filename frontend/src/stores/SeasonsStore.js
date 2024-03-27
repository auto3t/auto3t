import { create } from "zustand";

const useTVSeasonsStore = create((set) => ({
    seasons: [],
    setSeasons: (seasons) => set({ seasons }),
}));

export default useTVSeasonsStore
