import { useState, useEffect } from 'react'
import useApi from '../../hooks/api'
import { EpisodeType } from './Episode'
import { P, StyledLink } from '../Typography'

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
    <div className="grid grid-cols-8 text-sm py-2">
      <div className="text-right col-span-4 pr-4 h-full">
        {previousEpisode ? (
          <StyledLink
            title="previous episode"
            to={`/tv/episode/${previousEpisode.id}`}
          >
            <span>{'<'} </span>
            <span>
              S{String(previousEpisode.season.number).padStart(2, '0')}
            </span>
            <span>E{String(previousEpisode.number).padStart(2, '0')}</span>
            <span> - {previousEpisode.title}</span>
          </StyledLink>
        ) : (
          <P className="first-nav">First Episode</P>
        )}
      </div>
      <div className="border-l border-white pl-4 text-left col-span-4 h-full">
        {nextEpisode ? (
          <StyledLink title="next episode" to={`/tv/episode/${nextEpisode.id}`}>
            <span>S{String(nextEpisode.season.number).padStart(2, '0')}</span>
            <span>E{String(nextEpisode.number).padStart(2, '0')}</span>
            <span> - {nextEpisode.title}</span>
            <span> {'>'}</span>
          </StyledLink>
        ) : (
          <P>Last Episode</P>
        )}
      </div>
    </div>
  )
}

export default EpisodeNav
