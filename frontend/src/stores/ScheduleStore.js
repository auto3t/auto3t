import { create } from "zustand";

const useScheduleStore = create((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({schedules}),
  createSchedule: false,
  setCreateSchedule: (isCreating) => set({createSchedule: isCreating}),
  selectedSchedule: "",
  setSelectedSchedule: (newSelectedSchedule) => set({ selectedSchedule: newSelectedSchedule }),
  newSchedule: "",
  setNewSchedule: (newScheduleStr) => set({newSchedule: newScheduleStr}),
  deletingSchedule: null,
  setDeletingSchedule : (deletingSchedule) => set({deletingSchedule}),
}))

export default useScheduleStore;
