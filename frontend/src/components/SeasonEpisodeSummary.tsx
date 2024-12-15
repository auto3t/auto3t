import useTVEpisodeStore from "../stores/EpisodesStore";
import { formatBitrate, formatBytes } from "../utils";

const SeasonEpisodeSummary = () => {

  const { episodes } = useTVEpisodeStore();

  return (
    <>
      {episodes && (
        <>
          <h3>Episode Overview</h3>
          <table className="keyword-table">
            <thead>
              <tr>
                <th>Episode</th>
                <th>Resolution</th>
                <th>Codec</th>
                <th>Bitrate</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map((episode) => (
                <tr key={episode.id.toString()}>
                  <td>{episode.number.toString()}</td>
                  {episode.media_server_meta && (
                    <>
                      <td>{episode.media_server_meta.width}x{episode.media_server_meta.height}</td>
                      <td>{episode.media_server_meta.codec}</td>
                      <td>{formatBitrate(episode.media_server_meta.bitrate)}</td>
                      <td>{formatBytes(episode.media_server_meta.size)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  )
}

export default SeasonEpisodeSummary;
