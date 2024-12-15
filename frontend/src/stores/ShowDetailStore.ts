import {create} from "zustand";
import { ShowType } from "../components/ShowDetail";


interface ShowDetailStoreInterface {
  showDetail: ShowType | null;
  setShowDetail: (showDetail: ShowType) => void;
}

const useShowDetailStore = create<ShowDetailStoreInterface>((set) => ({
  showDetail: null,
  setShowDetail: (showDetail) => set({ showDetail: showDetail }),
}));

export default useShowDetailStore;
