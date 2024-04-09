import { create } from "zustand";

const useSearchKeyWordStore = create((set) => ({
    keywords: [],
    setKeywords: (keywords) => set({keywords}),
}));

export default useSearchKeyWordStore;
