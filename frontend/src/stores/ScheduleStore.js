import { create } from "zustand";

const useScheduleStore = create((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({schedules}),
  deletingSchedule: null,
  setDeletingSchedule : (deletingSchedule) => set({deletingSchedule}),
}))

export default useScheduleStore;
