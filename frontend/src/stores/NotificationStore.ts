import { create } from 'zustand'
import { NotificationType } from '../components/Notifications'

interface NotificationStoreInterface {
  showNotifications: boolean
  setShowNotifications: (showNotifications: boolean) => void
  notifications: NotificationType[]
  setNotifications: (notifications: NotificationType[]) => void
}

const useNotificationStore = create<NotificationStoreInterface>((set) => ({
  showNotifications: false,
  setShowNotifications: (showNotifications) => set({ showNotifications }),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}))

export default useNotificationStore
