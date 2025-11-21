import { useEffect, useState } from 'react'
import { H2, Input, Label, LucideIconWrapper, P } from '../Typography'
import useApi from '../../hooks/api'

type AppConfigType = {
  movie_archive_format: string
  movie_archive_format_display: string
  movie_archive_format_options: Record<string, string>
  tv_archive_format: string
  tv_archive_format_display: string
  tv_archive_format_options: Record<string, string>
  file_archive_operation: string
  file_archive_operation_display: string
  file_archive_options: Record<string, string>
}

export default function ArchiveOptions() {
  const { get, post } = useApi()
  const [appConfig, setAppConfig] = useState<AppConfigType | null>(null)
  const [newMovieArchiveFormat, setNewMovieArchiveFormat] = useState<
    string | null
  >(null)
  const [newFileArchive, setNewFileArchive] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const data = (await get('appconfig/')) as AppConfigType
        setAppConfig(data)
      } catch (error) {
        console.error('Error fetching appconfig: ', error)
      }
    }
    fetchAppConfig()
  }, [setAppConfig])

  const handleMovieArchiveFormatUpdate = async () => {
    try {
      const data = (await post('appconfig/', {
        movie_archive_format: newMovieArchiveFormat,
      })) as AppConfigType
      setNewMovieArchiveFormat(null)
      setAppConfig(data)
    } catch (error) {
      console.error('Error updating appconfig: ', error)
    }
  }

  const handleFileArchiveUpdate = async () => {
    try {
      const data = (await post('appconfig/', {
        file_archive_operation: newFileArchive,
      })) as AppConfigType
      setNewFileArchive(null)
      setAppConfig(data)
    } catch (error) {
      console.error('Error updating appconfig: ', error)
    }
  }

  return (
    <>
      <H2>Movie Archive Strategy</H2>
      <div className="pb-4">
        {appConfig !== null ? (
          Object.entries(appConfig.movie_archive_format_options).map(
            ([key, description]) => (
              <Label key={key} className="w-full block">
                <Input
                  type="radio"
                  name="movie-archive"
                  value={key}
                  variant="inline"
                  checked={
                    newMovieArchiveFormat
                      ? key === newMovieArchiveFormat
                      : key === appConfig.movie_archive_format
                  }
                  onChange={(e) => setNewMovieArchiveFormat(e.target.value)}
                />
                {description}
              </Label>
            ),
          )
        ) : (
          <P>Fetching movie archive options.</P>
        )}
        {newMovieArchiveFormat && (
          <div className="flex gap-2 mt-2">
            <LucideIconWrapper
              name="X"
              onClick={() => setNewMovieArchiveFormat(null)}
              className="cursor-pointer"
              title="Cancel editing"
            />
            <LucideIconWrapper
              name="Check"
              onClick={handleMovieArchiveFormatUpdate}
              className="cursor-pointer"
              colorClassName="text-green-700"
              title="Update movie archive strategy"
            />
          </div>
        )}
      </div>
      <H2>File Operation Option</H2>
      <div className="pb-4">
        {appConfig !== null ? (
          Object.entries(appConfig.file_archive_options).map(
            ([key, description]) => (
              <Label key={key} className="w-full block">
                <Input
                  type="radio"
                  name="file-archive"
                  value={key}
                  variant="inline"
                  checked={
                    newFileArchive
                      ? key === newFileArchive
                      : key === appConfig.file_archive_operation
                  }
                  onChange={(e) => setNewFileArchive(e.target.value)}
                />
                {description}
              </Label>
            ),
          )
        ) : (
          <P>Fetching file archive options.</P>
        )}
        {newFileArchive && (
          <div className="flex gap-2 mt-2">
            <LucideIconWrapper
              name="X"
              onClick={() => setNewFileArchive(null)}
              className="cursor-pointer"
              title="Cancel editing"
            />
            <LucideIconWrapper
              name="Check"
              onClick={handleFileArchiveUpdate}
              className="cursor-pointer"
              colorClassName="text-green-700"
              title="Update movie archive strategy"
            />
          </div>
        )}
      </div>
    </>
  )
}
