import { create } from "zustand";
import { EpisodeType } from "../components/Episode";
import { ImageType } from "../components/ImageComponent";

interface EpisodeDetailStoreInterface {
  episodeDetail: EpisodeType | null;
  setEpisodeDetail: (episodeDetail: EpisodeType) => void;
  episodeImage: ImageType | null;
  setEpisodeImage: (newEpisodeImage: ImageType) => void;
}

const useEpsiodeDetailStore = create<EpisodeDetailStoreInterface>((set) => ({
  episodeDetail: null,
  setEpisodeDetail: (episodeDetail) => set({ episodeDetail: episodeDetail }),
  episodeImage: null,
  setEpisodeImage: (newEpisodeImage) => set({ episodeImage: newEpisodeImage }),
}));

export default useEpsiodeDetailStore;
