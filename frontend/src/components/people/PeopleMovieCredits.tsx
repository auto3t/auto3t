import { useEffect, useState } from 'react'
import { PersonType } from '../../pages/people/Peoples'
import { H2, P } from '../Typography'
import useApi from '../../hooks/api'
import { MovieType } from '../../pages/movie/MovieDetails'
import Spinner from '../Spinner'
import MovieTile from '../movie/MovieTile'

export default function PeopleMovieCredits({ person }: { person: PersonType }) {
  const { get } = useApi()
  const [isLoading, setIsLoading] = useState(false)
  const [personMovies, setPersonMovies] = useState<MovieType[] | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true)
      try {
        const data = await get(`movie/movie/?person_id=${person.id}`)
        setPersonMovies(data)
      } catch (error) {
        console.error('error fetching movies: ', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMovies()
  }, [person.id])

  return (
    <div className="py-4">
      <H2>Movie Credits</H2>
      {isLoading || personMovies === null ? (
        <Spinner />
      ) : personMovies.length > 0 ? (
        <div className="grid grid-cols-6 gap-2">
          {personMovies.map((movie) => (
            <MovieTile key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <P>
          No movie credits found for{' '}
          <span className="text-accent-2">{person.name}</span>.
        </P>
      )}
    </div>
  )
}
