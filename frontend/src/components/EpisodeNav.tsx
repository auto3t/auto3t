import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useApi from '../hooks/api'
import { EpisodeType } from './Episode'

interface EpisodeNavInterface {
  currentEpisodeId: number
}

const EpisodeNav: React.FC<EpisodeNavInterface> = ({ currentEpisodeId }) => {
  const { get } = useApi()
  const [previousEpisode, setPreviousEpisode] = useState<EpisodeType | null>(
    null,
  )
  const [nextEpisode, setNextEpisode] = useState<EpisodeType | null>(null)

  useEffect(() => {
    const fetchPreviousEpisode = async () => {
      try {
        const data = await get(`tv/episode/${currentEpisodeId}/previous/`)
        if (Object.keys(data).length === 0 && data.constructor === Object) {
          setPreviousEpisode(null)
        } else {
          setPreviousEpisode(data)
        }
      } catch (error) {
        console.error('Error fetching previous episode:', error)
        setPreviousEpisode(null)
      }
    }

    const fetchNextEpisode = async () => {
      try {
        const data = await get(`tv/episode/${currentEpisodeId}/next/`)
        if (Object.keys(data).length === 0 && data.constructor === Object) {
          setNextEpisode(null)
        } else {
          setNextEpisode(data)
        }
      } catch (error) {
        console.error('Error fetching next episode:', error)
        setNextEpisode(null)
      }
    }

    fetchPreviousEpisode()
    fetchNextEpisode()
  }, [currentEpisodeId])

  return (
    <div className="episode-nav-container">
      <div className="episode-nav">
        {previousEpisode ? (
          <Link
            className="first-nav"
            title="previous episode"
            to={`/tv/episode/${previousEpisode.id}`}
          >
            <span>&#65308; </span>
            <span>
              S{String(previousEpisode.season.number).padStart(2, '0')}
            </span>
            <span>E{String(previousEpisode.number).padStart(2, '0')}</span>
            <span> - {previousEpisode.title}</span>
          </Link>
        ) : (
          <span className="first-nav">First Episode</span>
        )}
        <span className="separator"> | </span>
        {nextEpisode ? (
          <Link
            className="next-nav"
            title="next episode"
            to={`/tv/episode/${nextEpisode.id}`}
          >
            <span>S{String(nextEpisode.season.number).padStart(2, '0')}</span>
            <span>E{String(nextEpisode.number).padStart(2, '0')}</span>
            <span> - {nextEpisode.title}</span>
            <span> &#65310;</span>
          </Link>
        ) : (
          <span className="next-nav">Last Episode</span>
        )}
      </div>
    </div>
  )
}

export default EpisodeNav
