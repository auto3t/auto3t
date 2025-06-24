import { create } from 'zustand'
import { SchedulerType } from '../components/settings/Schedule'

interface ScheduleStoreInterface {
  schedules: SchedulerType[]
  setSchedules: (schedules: SchedulerType[]) => void
  createSchedule: boolean
  setCreateSchedule: (isCreating: boolean) => void
  selectedSchedule: string
  setSelectedSchedule: (newSelectedSchedule: string) => void
  newSchedule: string
  setNewSchedule: (newScheduleStr: string) => void
  deletingSchedule: SchedulerType | null
  setDeletingSchedule: (deletingSchedule: SchedulerType | null) => void
}

const useScheduleStore = create<ScheduleStoreInterface>((set) => ({
  schedules: [],
  setSchedules: (schedules) => set({ schedules }),
  createSchedule: false,
  setCreateSchedule: (isCreating) => set({ createSchedule: isCreating }),
  selectedSchedule: '',
  setSelectedSchedule: (newSelectedSchedule) =>
    set({ selectedSchedule: newSelectedSchedule }),
  newSchedule: '',
  setNewSchedule: (newScheduleStr) => set({ newSchedule: newScheduleStr }),
  deletingSchedule: null,
  setDeletingSchedule: (deletingSchedule) => set({ deletingSchedule }),
}))

export default useScheduleStore
