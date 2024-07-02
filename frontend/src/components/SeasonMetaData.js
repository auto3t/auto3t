import { useState } from "react";
import useApi from "../hooks/api";
import TimeComponent from "./TimeComponent";
import useBulkUpdateStore from "../stores/EpisodeBulkUpdateStore";
import useSelectedSeasonStore from "../stores/SeasonSelectedStore";
import AddKeywordComponent from "./AddKeywordComponent";
import KeywordTableCompnent from "./KeywordTableComponent";
import TorrentSearch from "./TorrentSearch";

const SeasonMetaData = ({ fetchEpisodes }) => {

  const { post } = useApi();
  const { selectedSeason } = useSelectedSeasonStore();
  const [showSeasonDetails, setShowSeasonDetails] = useState(false);
  const { status, setStatus } = useBulkUpdateStore();

  const toggleShowSeasonDetails = () => {
    setShowSeasonDetails(!showSeasonDetails);
  }

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleBulkUpdate = () => {
    post(`tv/episode/?season=${selectedSeason.id}`, { status: status })
    .then(() => {
      fetchEpisodes(selectedSeason.id);
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <>
      <div className="season-detail">
        <h2>Season {selectedSeason.number}</h2>
        <span className='smaller'>ID: <a href={selectedSeason.remote_server_url} target='_blank' rel='noreferrer'>{selectedSeason.remote_server_id}</a></span>
        <p dangerouslySetInnerHTML={{__html: selectedSeason.description}} />
        <div className="tag-group">
          {selectedSeason.release_date && <span className="tag-item">Start: <TimeComponent timestamp={selectedSeason.release_date} /></span>}
          {selectedSeason.end_date && <span className="tag-item">End: <TimeComponent timestamp={selectedSeason.end_date} /></span>}
        </div>
        <button onClick={toggleShowSeasonDetails}>
          {showSeasonDetails ? "Hide Details" : "Season Details"}
        </button>
        {showSeasonDetails && (
          <>
            <table className="keyword-table">
              <tbody>
                <tr>
                  <td>Update Status</td>
                  <td>
                    <select defaultValue={''} onChange={handleStatusChange}>
                      <option value="">---</option>
                      <option value="u">Upcoming</option>
                      <option value="s">Searching</option>
                      <option value="i">Ignored</option>
                    </select>
                    {status && <button onClick={handleBulkUpdate}>Update</button>}
                  </td>
                </tr>
                <tr>
                  <td>Add Keyword</td>
                  <td>
                    <AddKeywordComponent
                      patchURL={`tv/season/${selectedSeason.id}/?direction=add`}
                      refreshCallback={() => fetchEpisodes(selectedSeason.id)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <KeywordTableCompnent
              all_keywords={selectedSeason.all_keywords}
              patchURL={`tv/season/${selectedSeason.id}/?direction=remove`}
              refreshCallback={() => fetchEpisodes(selectedSeason.id)}
            />
            <TorrentSearch searchType='season' searchTypeId={selectedSeason.id} searchDefault={selectedSeason.search_query} />
          </>
        )}
      </div>
    </>
  )
}

export default SeasonMetaData;
