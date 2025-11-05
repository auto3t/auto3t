import { useEffect, useCallback, useState } from 'react'
import useTVSeasonsStore from '../../stores/SeasonsStore'
import useSelectedSeasonStore from '../../stores/SeasonSelectedStore'
import useTVEpisodeStore from '../../stores/EpisodesStore'
import useShowDetailStore from '../../stores/ShowDetailStore'
import Episode from '../../components/tv/Episode'
import Season from '../../components/tv/Season'
import ShowDetail from '../../components/tv/ShowDetail'
import useApi from '../../hooks/api'
import SeasonMetaData from '../../components/tv/SeasonMetaData'
import { useParams } from 'react-router-dom'
import { Button, H2, P } from '../../components/Typography'
import Spinner from '../../components/Spinner'
import { useProgressStore } from '../../stores/ProgressStore'
import PeopleCredits from '../../components/people/PeopleCredits'

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
  const { setRefetch } = useProgressStore()
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
      const data = await get(`tv/show/${id}/`)
      setShowDetail(data)
    } catch (error) {
      console.error('error fetching show: ', id, error)
    }
  }, [id])

  useEffect(() => {
    fetchShow()
  }, [id, fetchShow])

  const fetchSeasons = useCallback(async () => {
    try {
      const data = await get(`tv/season/?show=${id}`)
      setSeasons(data)
    } catch (error) {
      console.error('error fetching seasons: ', error)
    }
    setIsLoadingSeasons(false)
  }, [id])

  useEffect(() => {
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

  useEffect(() => {
    setRefetch(() => {
      fetchShow()
      fetchSeasons()
      if (selectedSeason !== null) fetchEpisodes(selectedSeason.id)
    })
  }, [setRefetch, fetchShow, fetchSeasons, fetchEpisodes])

  const handleSeasonClick = (seasonId: number) => {
    setIsLoadingEpisodes(true)
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
      {id && <PeopleCredits parent="show" id={id} />}
      <div className="p-4 my-4 border border-accent-2">
        {isLoadingSeasons ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <H2>Seasons</H2>
            <div className="grid grid-cols-6 gap-2 my-4">
              {Array.isArray(seasons) && seasons.length > 0 ? (
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
            {selectedSeason && <SeasonMetaData fetchEpisodes={fetchEpisodes} />}
          </>
        )}
      </div>
      {selectedSeason ? (
        <>
          {isLoadingEpisodes ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {episodes?.length > 0 &&
                episodes.map((episode) => (
                  <Episode key={episode.id} episode={episode} />
                ))}
            </div>
          )}
        </>
      ) : (
        <P>No episodes in season.</P>
      )}
    </>
  )
}

export default TVShowDetail
