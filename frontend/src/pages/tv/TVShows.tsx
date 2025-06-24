import React, { useEffect, useState } from 'react'
import useTVShowsStore from '../../stores/ShowsStore'
import ShowTile from '../../components/tv/ShowTile'
import useApi from '../../hooks/api'
import { Link } from 'react-router-dom'
import useUserProfileStore from '../../stores/UserProfileStore'
import { Button, H1, Input, P, Select } from '../../components/Typography'

export default function TVShows() {
  const { userProfile, setUserProfile } = useUserProfileStore()
  const [isLoadingShows, setIsLoadingShows] = useState(true)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { error, get, post } = useApi()
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
      if (userProfile?.shows_status_filter) {
        params.append('status', userProfile.shows_status_filter)
      }
      if (userProfile && userProfile?.shows_active_filter !== null) {
        params.append('is_active', userProfile.shows_active_filter)
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
  }, [
    setShows,
    searchTerm,
    userProfile?.shows_status_filter,
    userProfile?.shows_active_filter,
  ])

  const handleShowSearchInput = async () => {
    if (showSearchInput) {
      setShowSearchInput(false)
      setSearchTerm('')
    } else {
      setShowSearchInput(true)
    }
  }

  const handleStatusFilterUpdate = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = event.target.value === '' ? null : event.target.value
    post('user/profile/', { shows_status_filter: newStatus })
      .then((data) => {
        setUserProfile(data)
      })
      .catch((error) => {
        console.error('Error updating status:', error)
      })
  }

  const handleActiveFilterUpdate = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newActive: boolean | null =
      event.target.value === '' ? null : event.target.value === '1'
    post('user/profile/', { shows_active_filter: newActive })
      .then((data) => {
        setUserProfile(data)
      })
      .catch((error) => {
        console.error('Error updating status:', error)
      })
  }

  return (
    <>
      <H1>TV Shows</H1>
      <div className="filter-bar">
        <Link to={'search'}>
          <Button>Add</Button>
        </Link>
        <Button onClick={handleShowSearchInput}>
          {showSearchInput ? 'Cancel' : 'Search'}
        </Button>
        {showSearchInput && (
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        )}
        {userProfile && (
          <>
            <Select
              defaultValue={userProfile.shows_status_filter}
              onChange={handleStatusFilterUpdate}
            >
              <option value={''}>--- all show status ---</option>
              <option value="r">Running</option>
              <option value="e">Ended</option>
              <option value="d">In Development</option>
              <option value="t">To Be Determined</option>
            </Select>
            <Select
              defaultValue={
                userProfile.shows_active_filter === null
                  ? ''
                  : userProfile.shows_active_filter
                    ? '1'
                    : '0'
              }
              onChange={handleActiveFilterUpdate}
            >
              <option value={''}>--- all ---</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </Select>
          </>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {isLoadingShows ? (
          <P>Loading...</P>
        ) : error ? (
          <P>Error: {error}</P>
        ) : shows.length > 0 ? (
          shows.map((show) => <ShowTile key={show.id.toString()} show={show} />)
        ) : (
          <>
            {searchTerm ? (
              <P>No Shows matching search query.</P>
            ) : (
              <P>No Shows found.</P>
            )}
          </>
        )}
      </div>
    </>
  )
}
