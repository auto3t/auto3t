import { useState } from 'react'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'
import useBulkUpdateStore from '../stores/EpisodeBulkUpdateStore'
import useSelectedSeasonStore from '../stores/SeasonSelectedStore'
import AddKeywordComponent from './AddKeywordComponent'
import KeywordTableCompnent from './KeywordTableComponent'
import ManualSearch from './ManualSearch'
import SeasonEpisodeSummary from './SeasonEpisodeSummary'
import { Button, H2, P, Select, StyledLink, Table, TagItem } from './Typography'

interface SeasonMetaDataInterface {
  fetchEpisodes: (seasonId: number) => void
}

const SeasonMetaData: React.FC<SeasonMetaDataInterface> = ({
  fetchEpisodes,
}) => {
  const { post } = useApi()
  const { selectedSeason } = useSelectedSeasonStore()
  const [showSeasonDetails, setShowSeasonDetails] = useState(false)
  const { status, setStatus } = useBulkUpdateStore()

  const toggleShowSeasonDetails = () => {
    setShowSeasonDetails(!showSeasonDetails)
  }

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(event.target.value)
  }

  const handleBulkUpdate = () => {
    if (!selectedSeason) return
    post(`tv/episode/?season=${selectedSeason.id}`, { status: status })
      .then(() => {
        fetchEpisodes(selectedSeason.id)
      })
      .catch((error) => console.error('Error:', error))
  }

  if (selectedSeason === null) return <></>

  return (
    <>
      <div className="p-4 my-4 border border-accent-2">
        <H2>Season {selectedSeason.number.toString()}</H2>
        <P variant="smaller">
          ID:{' '}
          <StyledLink
            to={selectedSeason.remote_server_url}
            target="_blank"
            rel="noreferrer"
          >
            {selectedSeason.tvmaze_id}
          </StyledLink>
        </P>
        <P dangerouslySetInnerHTML={{ __html: selectedSeason.description }} />
        <div className="flex gap-2 my-2">
          {selectedSeason.release_date && (
            <TagItem>
              Start: <TimeComponent timestamp={selectedSeason.release_date} />
            </TagItem>
          )}
          {selectedSeason.end_date && (
            <TagItem>
              End: <TimeComponent timestamp={selectedSeason.end_date} />
            </TagItem>
          )}
        </div>
        <Button onClick={toggleShowSeasonDetails}>
          {showSeasonDetails ? 'Hide Details' : 'Season Details'}
        </Button>
        {showSeasonDetails && (
          <>
            <Table
              rows={[
                [
                  'Update Status',
                  <>
                    <Select defaultValue={''} onChange={handleStatusChange}>
                      <option value="">---</option>
                      <option value="u">Upcoming</option>
                      <option value="s">Searching</option>
                      <option value="i">Ignored</option>
                    </Select>
                    {status && (
                      <Button className="ml-2" onClick={handleBulkUpdate}>
                        Update
                      </Button>
                    )}
                  </>,
                ],
                [
                  'Add Keyword',
                  <AddKeywordComponent
                    key={`add-keword-form`}
                    patchURL={`tv/season/${selectedSeason.id}/?direction=add`}
                    refreshCallback={() => fetchEpisodes(selectedSeason.id)}
                  />,
                ],
              ]}
            />
            <KeywordTableCompnent
              all_keywords={selectedSeason.all_keywords}
              patchURL={`tv/season/${selectedSeason.id}/?direction=remove`}
              refreshCallback={() => fetchEpisodes(selectedSeason.id)}
            />
            <SeasonEpisodeSummary />
            <ManualSearch
              searchType="season"
              searchTypeId={selectedSeason.id}
              searchDefault={selectedSeason.search_query}
            />
          </>
        )}
      </div>
    </>
  )
}

export default SeasonMetaData
