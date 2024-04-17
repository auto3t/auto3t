import useBulkUpdateStore from "../stores/EpisodeBulkUpdateStore";
import { post } from "../api";

const BulkUpdateEpisodes = ({ seasonId, fetchEpisodes }) => {

    const { status, setStatus } = useBulkUpdateStore();

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleBulkUpdate = () => {
        post(`episode/?season=${seasonId}`, { status: status })
        .then(() => {
            fetchEpisodes(seasonId);
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div>
            <h3>Bulk Update Episodes</h3>
            <div>
                <label htmlFor="statusSelect">Update Status:</label>
                <select id="statusSelect" value={status} onChange={handleStatusChange}>
                    <option value="">Select</option>
                    <option value="u">Upcoming</option>
                    <option value="s">Searching</option>
                    <option value="i">Ignored</option>
                </select>
                <button onClick={handleBulkUpdate}>Update</button>
            </div>
        </div>
    );
};

export default BulkUpdateEpisodes;
