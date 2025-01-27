import { create } from 'zustand'

type UserProfileType = {
  shows_active_filter: string
  shows_status_filter: string
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
