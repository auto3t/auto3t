import { useState } from "react";
import BulkUpdateEpisodes from "./EpisodeBulkUpdate";
import TimeComponent from "./TimeComponent";

const SeasonMetaData = ({ season, fetchEpisodes }) => {

  const [seasonConfigure, setSeasonConfigure] = useState(false);

  const toggleSeasonConfigure = () => {
    setSeasonConfigure(!seasonConfigure);
  }

  return (
    <>
      <div className="season-detail">
        <h2>Season {season.number}</h2>
        <span className='smaller'>ID: {season.remote_server_id}</span>
        <p dangerouslySetInnerHTML={{__html: season.description}} />
        <div className="tag-group">
          {season.release_date && <span className="tag-item">Premiered: <TimeComponent timestamp={season.release_date} /></span>}
          {season.end_date && <span className="tag-item">Ended: <TimeComponent timestamp={season.end_date} /></span>}
        </div>
        <button onClick={toggleSeasonConfigure}>
          {seasonConfigure ? "Hide" : "Configure"}
        </button>
        {seasonConfigure && (
          <>
            <h3>Configure Season</h3>
            <BulkUpdateEpisodes seasonId={season.id} fetchEpisodes={fetchEpisodes}/>
          </>
        )}
      </div>
    </>
  )
}

export default SeasonMetaData;
