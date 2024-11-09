import { create } from "zustand";

const useScheduleStore = create((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({schedules}),
}))

export default useScheduleStore;
