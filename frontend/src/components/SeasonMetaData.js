import { useState } from "react";
import TimeComponent from "./TimeComponent";
import useBulkUpdateStore from "../stores/EpisodeBulkUpdateStore";
import useApi from "../hooks/api";

const SeasonMetaData = ({ season, fetchEpisodes }) => {

  const { post } = useApi();
  const [seasonConfigure, setSeasonConfigure] = useState(false);
  const { status, setStatus } = useBulkUpdateStore();

  const toggleSeasonConfigure = () => {
    setSeasonConfigure(!seasonConfigure);
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
        <button onClick={toggleSeasonConfigure}>
          {seasonConfigure ? "Hide" : "Configure Season"}
        </button>
        {seasonConfigure && (
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
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  )
}

export default SeasonMetaData;
