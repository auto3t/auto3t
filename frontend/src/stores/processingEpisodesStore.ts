import { create } from "zustand";
import { EpisodeType } from "../components/Episode";

interface ProcessingEpisodeStore {
  processingEpisodes: EpisodeType[];
  setProcessingEpisodes: (processingEpisodes: EpisodeType[]) => void;
}

const useProcessingEpisodeStore = create<ProcessingEpisodeStore>((set) => ({
  processingEpisodes: [],
  setProcessingEpisodes: (processingEpisodes) => set({ processingEpisodes }),
}));

export default useProcessingEpisodeStore
