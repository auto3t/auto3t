import { useEffect, useState } from 'react'
import { Button, H2, Input, Label, P } from '../Typography'
import useApi from '../../hooks/api'

type AppConfigType = {
  movie_archive_format: string
  movie_archive_format_display: string
  movie_archive_format_options: Record<string, string>
  tv_archive_format: string
  tv_archive_format_display: string
  tv_archive_format_options: Record<string, string>
}

export default function ArchiveOptions() {
  const { get, post } = useApi()
  const [appConfig, setAppConfig] = useState<AppConfigType | null>(null)
  const [newMovieArchiveFormat, setNewMovieArchiveFormat] = useState<
    string | null
  >(null)

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

  return (
    <>
      <H2>Movie Archive Strategy</H2>
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
                onClick={() => setNewMovieArchiveFormat(key)}
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
          <Button onClick={() => setNewMovieArchiveFormat(null)}>Cancel</Button>
          <Button onClick={handleMovieArchiveFormatUpdate}>Save</Button>
        </div>
      )}
    </>
  )
}
