import { create } from "zustand";

const useNotificationStore = create((set) => ({
  showNotifications: false,
  setShowNotifications: (showNotifications) => set({ showNotifications}),
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}));

export default useNotificationStore
