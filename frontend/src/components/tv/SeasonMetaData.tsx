import { useState } from 'react'
import useApi from '../../hooks/api'
import TimeComponent from '../TimeComponent'
import useBulkUpdateStore from '../../stores/EpisodeBulkUpdateStore'
import useSelectedSeasonStore from '../../stores/SeasonSelectedStore'
import AddKeywordComponent from '../AddKeywordComponent'
import KeywordTableCompnent from '../KeywordTableComponent'
import ManualSearch from '../ManualSearch'
import SeasonEpisodeSummary from './SeasonEpisodeSummary'
import {
  Button,
  LucideIconWrapper,
  P,
  Select,
  StyledLink,
  Table,
  TagItem,
} from '../Typography'
import { formatDuration } from '../../utils'

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
      <div className="mt-4">
        <div className="inline-grid grid-cols-2 gap-2 pb-4">
          <P>tvmaze</P>
          <StyledLink
            to={selectedSeason.remote_server_url}
            target="_blank"
            rel="noreferrer"
          >
            {selectedSeason.tvmaze_id}
          </StyledLink>
        </div>
      </div>
      <P dangerouslySetInnerHTML={{ __html: selectedSeason.description }} />
      <div className="flex flex-wrap md:justify-normal justify-center gap-2 mt-2 mb-8">
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
        {selectedSeason.runtime && (
          <TagItem>
            {`Runtime: ${formatDuration(selectedSeason.runtime * 60)}`}
          </TagItem>
        )}
        {selectedSeason.target_file_size_str && (
          <TagItem>
            {`Target Filesize: ${selectedSeason.target_file_size_str}`}
          </TagItem>
        )}
      </div>
      <Button
        onClick={toggleShowSeasonDetails}
        iconBefore={
          showSeasonDetails ? (
            <LucideIconWrapper
              name="ChevronUp"
              colorClassName="text-white"
              className="cursor-pointer"
            />
          ) : (
            <LucideIconWrapper
              name="ChevronDown"
              colorClassName="text-white"
              className="cursor-pointer"
            />
          )
        }
      >
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
            inheritKey="show"
            inheritId={selectedSeason.show.id}
          />
          <SeasonEpisodeSummary />
          <ManualSearch
            searchType="season"
            searchTypeId={selectedSeason.id}
            searchDefault={selectedSeason.search_query}
          />
        </>
      )}
    </>
  )
}

export default SeasonMetaData
