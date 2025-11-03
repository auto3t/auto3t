import { create } from 'zustand'

type UserProfileType = {
  shows_active_filter: string
  shows_status_filter: string
  movies_production_filter: string
  movies_active_filter: string
  movie_status_filter: string
  collection_tracking_filter: string
}

interface UserProfileInterface {
  userProfile: UserProfileType | null
  setUserProfile: (userProfile: UserProfileType) => void
}

const useUserProfileStore = create<UserProfileInterface>((set) => ({
  userProfile: null,
  setUserProfile: (userProfile) => set({ userProfile }),
}))

export default useUserProfileStore
