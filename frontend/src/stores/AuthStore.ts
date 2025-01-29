import { create } from 'zustand'

interface AuthStoreInterface {
  isLoggedIn: boolean
  setIsLoggedIn: (newState: boolean) => void
}

const useAuthStore = create<AuthStoreInterface>((set) => ({
  isLoggedIn: localStorage.getItem('isLoggedIn') === 'true' || false,
  setIsLoggedIn: (newState) => {
    if (newState) {
      localStorage.setItem('isLoggedIn', 'true')
      set({ isLoggedIn: true })
    } else {
      localStorage.removeItem('isLoggedIn')
      set({ isLoggedIn: false })
    }
  },
}))

export default useAuthStore
