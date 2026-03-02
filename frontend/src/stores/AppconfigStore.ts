import { create } from 'zustand'

export type AppConfigType = {
  movie_archive_format: string
  movie_archive_format_display: string
  movie_archive_format_options: Record<string, string>
  tv_archive_format: string
  tv_archive_format_display: string
  tv_archive_format_options: Record<string, string>
  file_archive_operation: string
  file_archive_operation_display: string
  file_archive_options: Record<string, string>
  integrate_imdb: boolean
}

interface AppConfigInterface {
  appConfig: AppConfigType | null
  setAppConfig: (appConfig: AppConfigType) => void
}

const useAppconfigStore = create<AppConfigInterface>((set) => ({
  appConfig: null,
  setAppConfig: (appConfig) => set({ appConfig }),
}))

export default useAppconfigStore
