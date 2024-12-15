import { create } from "zustand";
import { SeasonType } from "../components/Season";

interface TVSeasonsStoreInterface {
  seasons: SeasonType[];
  setSeasons: (seasons: SeasonType[]) => void;
}

const useTVSeasonsStore = create<TVSeasonsStoreInterface>((set) => ({
  seasons: [],
  setSeasons: (seasons) => set({ seasons }),
}));

export default useTVSeasonsStore
