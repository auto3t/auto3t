import { useEffect, useCallback, useState } from 'react'
import useTVSeasonsStore from '../../stores/SeasonsStore'
import useSelectedSeasonStore from '../../stores/SeasonSelectedStore'
import useTVEpisodeStore from '../../stores/EpisodesStore'
import useShowDetailStore from '../../stores/ShowDetailStore'
import Episode from '../../components/Episode'
import Season from '../../components/Season'
import ShowDetail from '../../components/ShowDetail'
import useApi from '../../hooks/api'
import SeasonMetaData from '../../components/SeasonMetaData'
import { useParams } from 'react-router-dom'
import { Button, P } from '../../components/Typography'

const TVShowDetail: React.FC = () => {
  const { id } = useParams()
  const { get } = useApi()
  const {
    selectedSeason,
    setSelectedSeason,
    showAllSeasons,
    setShowAllSeasons,
  } = useSelectedSeasonStore()
  const { showDetail, setShowDetail } = useShowDetailStore()
  const { seasons, setSeasons } = useTVSeasonsStore()
  const { episodes, setEpisodes } = useTVEpisodeStore()
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true)
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true)

  const fetchEpisodes = useCallback(
    async (seasonId: number) => {
      try {
        const data = await get(`tv/episode/?show=${id}&season=${seasonId}`)
        setEpisodes(data)
        setSelectedSeason(data.length > 0 ? data[0].season : null)
      } catch (error) {
        console.error('error fetching episodes: ', error)
      }
      setIsLoadingEpisodes(false)
    },
    [id, setEpisodes, setSelectedSeason],
  )

  const fetchShow = useCallback(async () => {
    try {
      const data = await get(`tv/show/${id}`)
      setShowDetail(data)
    } catch (error) {
      console.error('error fetching show: ', id, error)
    }
  }, [])

  useEffect(() => {
    fetchShow()
  }, [id])

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const data = await get(`tv/season/?show=${id}`)
        setSeasons(data)
      } catch (error) {
        console.error('error fetching seasons: ', error)
      }
      setIsLoadingSeasons(false)
    }
    fetchSeasons()
  }, [id, setSeasons, setShowDetail])

  useEffect(() => {
    if (seasons.length > 0) {
      const firstSeasonWithReleaseDate = seasons.find(
        (season) => season.release_date,
      )
      if (firstSeasonWithReleaseDate) {
        fetchEpisodes(firstSeasonWithReleaseDate.id)
      }
    }
  }, [id, seasons, fetchEpisodes])

  const handleSeasonClick = (seasonId: number) => {
    fetchEpisodes(seasonId)
  }

  const toggleShowAllSeasons = () => {
    setShowAllSeasons(!showAllSeasons)
  }

  return (
    <>
      {showDetail && (
        <ShowDetail showDetail={showDetail} fetchShow={fetchShow} />
      )}
      <div>
        <div className="grid grid-cols-6 gap-2 my-4">
          {isLoadingSeasons ? (
            <P>Loading...</P>
          ) : Array.isArray(seasons) && seasons.length > 0 ? (
            showAllSeasons ? (
              seasons.map((season) => (
                <Season
                  key={season.id.toString()}
                  season={season}
                  onClick={handleSeasonClick}
                />
              ))
            ) : (
              seasons
                .slice(0, 6)
                .map((season) => (
                  <Season
                    key={season.id.toString()}
                    season={season}
                    onClick={handleSeasonClick}
                  />
                ))
            )
          ) : (
            <P>No Seasons found.</P>
          )}
        </div>
        {seasons.length > 6 && (
          <Button onClick={toggleShowAllSeasons}>
            {showAllSeasons ? 'Show Less' : 'Show More'}
          </Button>
        )}
      </div>
      {selectedSeason ? (
        <>
          <SeasonMetaData fetchEpisodes={fetchEpisodes} />
          <div className="grid grid-cols-3 gap-2">
            {isLoadingEpisodes ? (
              <P>Loading...</P>
            ) : (
              episodes?.length > 0 &&
              episodes.map((episode) => (
                <Episode key={episode.id} episode={episode} />
              ))
            )}
          </div>
        </>
      ) : (
        <P>No episodes in season.</P>
      )}
    </>
  )
}

export default TVShowDetail
