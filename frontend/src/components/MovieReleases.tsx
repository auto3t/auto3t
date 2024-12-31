import { useCallback, useEffect, useState } from 'react'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'

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

  return (
    <>
      <h2>Releases</h2>
      {releases ? (
        releases.map((release) => (
          <div key={release.id}>
            <span className="tag-item">{release.country}</span>
            <span>{release.release_type_display}</span>
            <TimeComponent timestamp={release.release_date} />
            {release.release_lang && <span>{release.release_lang}</span>}
            {release.note && <span>{release.note}</span>}
          </div>
        ))
      ) : (
        <p>No release found.</p>
      )}
    </>
  )
}

export default MovieReleases
