import { useEffect, useState } from 'react'
import useTVShowsStore from '../../stores/ShowsStore'
import ShowTile from '../../components/ShowTile'
import useApi from '../../hooks/api'
import { Link } from 'react-router-dom'

export default function TVShows() {
  const [isLoadingShows, setIsLoadingShows] = useState(true)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { error, get } = useApi()
  const { shows, setShows } = useTVShowsStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault()
        setShowSearchInput(true)
      } else if (event.key === 'Escape') {
        setShowSearchInput(false)
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const fetchShows = async () => {
      const params = new URLSearchParams()
      if (showSearchInput) {
        params.append('q', searchTerm)
      }
      try {
        const data = await get(`tv/show/?${params.toString()}`)
        setShows(data)
      } catch (error) {
        console.error('Error fetching shows:', error)
      }
      setIsLoadingShows(false)
    }

    fetchShows()
  }, [setShows, searchTerm])

  const handleShowSearchInput = async () => {
    if (showSearchInput) {
      setShowSearchInput(false)
      setSearchTerm('')
    } else {
      setShowSearchInput(true)
    }
  }

  return (
    <div className="tvshows">
      <h1>TV Shows</h1>
      <div className="filter-bar">
        <Link to={'search'}>
          <button>Add</button>
        </Link>
        <button onClick={handleShowSearchInput}>
          {showSearchInput ? 'Cancel' : 'Search'}
        </button>
        {showSearchInput && (
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        )}
      </div>
      <div className="show-items">
        {isLoadingShows ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : shows.length > 0 ? (
          shows.map((show) => <ShowTile key={show.id.toString()} show={show} />)
        ) : (
          <>
            {searchTerm ? (
              <p>No Shows matching search query.</p>
            ) : (
              <p>No Shows found.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
