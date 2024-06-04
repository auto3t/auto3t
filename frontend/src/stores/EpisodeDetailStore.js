import { create } from "zustand";

const useEpsiodeDetailStore = create((set) => ({
  episodeDetail: null,
  setEpisodeDetail: (episodeDetail) => set({ episodeDetail: episodeDetail }),
  episodeImage: null,
  setEpisodeImage: (newEpisodeImage) => set({ episodeImage: newEpisodeImage }),
}));

export default useEpsiodeDetailStore;
