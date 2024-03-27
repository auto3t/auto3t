import { create } from "zustand";

const useTVEpisodeStore = create((set) => ({
    episodes: [],
    setEpisodes: (episodes) => set({ episodes }),
}));

export default useTVEpisodeStore
