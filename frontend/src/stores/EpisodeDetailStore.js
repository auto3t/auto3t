import { create } from "zustand";

const useEpsiodeDetailStore = create((set) => ({
  episodeDetail: null,
  setEpisodeDetail: (episodeDetail) => set({ episodeDetail: episodeDetail }),
}));

export default useEpsiodeDetailStore;
