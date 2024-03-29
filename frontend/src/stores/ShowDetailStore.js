import {create} from "zustand";

const useShowDetailStore = create((set) => ({
  showDetail: null,
  setShowDetail: (showDetail) => set({ showDetail: showDetail }),
}));

export default useShowDetailStore;
