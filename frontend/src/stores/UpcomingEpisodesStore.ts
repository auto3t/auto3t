import { create } from 'zustand'
import { EpisodeType } from '../components/Episode'

interface UpcomingEpisodesStoreInterface {
  upcomingEpisodes: EpisodeType[]
  setUpcomingEpisodes: (upcomingEpisodes: EpisodeType[]) => void
}

const useUpcomingEpisodeStore = create<UpcomingEpisodesStoreInterface>(
  (set) => ({
    upcomingEpisodes: [],
    setUpcomingEpisodes: (upcomingEpisodes) => set({ upcomingEpisodes }),
  }),
)

export default useUpcomingEpisodeStore
