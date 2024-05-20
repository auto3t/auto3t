import { create } from "zustand";

const useProcessingEpisodeStore = create((set) => ({
    processingEpisodes: [],
    setProcessingEpisodes: (processingEpisodes) => set({ processingEpisodes }),
}));

export default useProcessingEpisodeStore
