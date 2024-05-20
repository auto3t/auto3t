import { create } from "zustand";

const useUpcomingEpisodeStore = create((set) => ({
    upcomingEpisodes: [],
    setUpcomingEpisodes: (upcomingEpisodes) => set({ upcomingEpisodes }),
}));

export default useUpcomingEpisodeStore
