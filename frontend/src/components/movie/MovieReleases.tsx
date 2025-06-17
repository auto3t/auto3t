import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import TimeComponent from '../TimeComponent'
import { H2, P, Table } from '../Typography'

interface MovieReleasesInterface {
  movie_id: number
}

type MovieReleaseType = {
  id: number
  country: string
  release_type: number
  release_type_display: string
  release_date: string
  release_lang?: string
  note?: string
}

const MovieReleases: React.FC<MovieReleasesInterface> = ({ movie_id }) => {
  const [releases, setReleases] = useState<MovieReleaseType[]>([])
  const { get } = useApi()

  const fetchReleases = useCallback(
    async (movie_id: number) => {
      try {
        const data = await get(`movie/movie/${movie_id}/releases/`)
        setReleases(data)
      } catch {
        console.error('error fetching releases')
      }
    },
    [movie_id],
  )

  useEffect(() => {
    fetchReleases(movie_id)
  }, [movie_id])

  const headers = ['Country', 'Medium', 'Date', 'Language', 'Note']
  const rows = releases.map((release) => [
    release.country,
    release.release_type_display,
    <TimeComponent
      timestamp={release.release_date}
      key={`release-date-${release.id}`}
    />,
    release.release_lang,
    release.note,
  ])

  return (
    <>
      <H2>Releases</H2>
      {releases.length > 0 ? (
        <Table headers={headers} rows={rows} className="w-full" />
      ) : (
        <P>No release found.</P>
      )}
    </>
  )
}

export default MovieReleases
