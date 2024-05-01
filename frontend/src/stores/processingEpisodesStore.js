import { create } from "zustand";

const useProcessingEpisodeStore = create((set) => ({
    episodes: [],
    setEpisodes: (episodes) => set({ episodes }),
}));

export default useProcessingEpisodeStore
