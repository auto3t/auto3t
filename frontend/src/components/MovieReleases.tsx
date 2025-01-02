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
        <div className="movie-release-table">
          <div className="movie-release-row row-title">
            <span className="movie-release-cell">Country</span>
            <span className="movie-release-cell">Medium</span>
            <span className="movie-release-cell">Date</span>
            <span className="movie-release-cell">Language</span>
            <span className="movie-release-cell">Note</span>
          </div>
          {releases.map((release) => (
            <div key={release.id} className="movie-release-row">
              <span className="movie-release-cell">{release.country}</span>
              <span className="movie-release-cell">
                {release.release_type_display}
              </span>
              <span className="movie-release-cell">
                <TimeComponent timestamp={release.release_date} />
              </span>
              <span className="movie-release-cell">{release.release_lang}</span>
              <span className="movie-release-cell">{release.note}</span>
            </div>
          ))}
        </div>
      ) : (
        <p>No release found.</p>
      )}
    </>
  )
}

export default MovieReleases
