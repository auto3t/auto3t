import { create } from "zustand";
import { EpisodeType } from "../components/Episode";

interface TVEpisodeStoreInterface {
  episodes: EpisodeType[];
  setEpisodes: (episodes: EpisodeType[]) => void;
}

const useTVEpisodeStore = create<TVEpisodeStoreInterface>((set) => ({
  episodes: [],
  setEpisodes: (episodes) => set({ episodes }),
}));

export default useTVEpisodeStore
