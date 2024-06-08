import { useState } from "react";
import useApi from "../hooks/api";
import TimeComponent from "./TimeComponent";
import useBulkUpdateStore from "../stores/EpisodeBulkUpdateStore";
import AddKeywordComponent from "./AddKeywordComponent";
import KeywordTableCompnent from "./KeywordTableComponent";

const SeasonMetaData = ({ season, fetchEpisodes }) => {

  const { post } = useApi();
  const [showSeasonDetails, setShowSeasonDetails] = useState(false);
  const { status, setStatus } = useBulkUpdateStore();

  const toggleShowSeasonDetails = () => {
    setShowSeasonDetails(!showSeasonDetails);
  }

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleBulkUpdate = () => {
    post(`tv/episode/?season=${season.id}`, { status: status })
    .then(() => {
      fetchEpisodes(season.id);
    })
    .catch(error => console.error('Error:', error));
  };

  return (
    <>
      <div className="season-detail">
        <h2>Season {season.number}</h2>
        <span className='smaller'>ID: <a href={season.remote_server_url} target='_blank' rel='noreferrer'>{season.remote_server_id}</a></span>
        <p dangerouslySetInnerHTML={{__html: season.description}} />
        <div className="tag-group">
          {season.release_date && <span className="tag-item">Start: <TimeComponent timestamp={season.release_date} /></span>}
          {season.end_date && <span className="tag-item">End: <TimeComponent timestamp={season.end_date} /></span>}
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
                      patchURL={`tv/season/${season.id}/?direction=add`}
                      refreshCallback={() => fetchEpisodes(season.id)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <KeywordTableCompnent
              all_keywords={season.all_keywords}
              patchURL={`tv/season/${season.id}/?direction=remove`}
              refreshCallback={() => fetchEpisodes(season.id)}
            />
          </>
        )}
      </div>
    </>
  )
}

export default SeasonMetaData;
