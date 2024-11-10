import { useCallback, useEffect } from "react";
import useApi from "../hooks/api"
import useScheduleStore from "../stores/ScheduleStore";
import TimeComponent from "./TimeComponent";

export default function Schedule() {

  const { get, post, del } = useApi();

  const {
    schedules,
    setSchedules,
    createSchedule,
    setCreateSchedule,
    selectedSchedule,
    setSelectedSchedule,
    newSchedule,
    setNewSchedule,
    deletingSchedule,
    setDeletingSchedule,
  } = useScheduleStore();

  const fetchSchedules = useCallback(async () => {
    const data = await get('scheduler/');
    setSchedules(data);
  }, [setSchedules]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleDeleteSchedule = (schedule) => {
    setDeletingSchedule(schedule);
  }

  const handleCancleDeleteSchedule = () => {
    setDeletingSchedule(null);
  }

  const handleDeleteScheduleConfirm = async () => {
    try {
      const data = await del(`scheduler/${deletingSchedule.id}/`);
      if (data) {
        setDeletingSchedule(null);
        fetchSchedules();
      } else {
        console.error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  }

  const handleShowAddForm = () => {
    setCreateSchedule(true);
  }

  const handleCancleCreate = () => {
    setCreateSchedule(false);
    setSelectedSchedule("");
    setNewSchedule("");
  }

  const handleCreateSchedule = async (event) => {
    event.preventDefault();
    try {
      const body = {
        job: selectedSchedule,
        cron_schedule: newSchedule,
      }
      const data = await post('scheduler/', body)
      if (data) {
        handleCancleCreate();
        fetchSchedules();
      } else {
        console.error('Failed to create schedule');
      }
    } catch (error) {
      console.error('Error creating keyword:', error);
    }
  }

  return (
    <>
      <h2>Schedule</h2>
      <table className="keyword-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Schedule</th>
            <th>Next Execution</th>
            <th>
              {createSchedule === false && (
                <button onClick={handleShowAddForm}>Add</button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {createSchedule === true && (
            <tr>
              <td>
                <select value={selectedSchedule} onChange={(e) => setSelectedSchedule(e.target.value)}>
                  <option value="">Select Schedule</option>
                  <option value="tv.tasks.refresh_all_shows">Refresh All Shows</option>
                  <option value="tv.tasks.refresh_status">Refresh Status</option>
                </select>
              </td>
              <td>
                <input 
                  type="text"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  placeholder="Enter Cron Schedule"
                />
              </td>
              <td></td>
              <td>
                <button onClick={handleCreateSchedule}>Create Schedule</button>
                <button onClick={handleCancleCreate}>Cancel</button>
              </td>
            </tr>
          )}
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td>{schedule.job_display}</td>
              <td>{schedule.cron_schedule}</td>
              <td>{<TimeComponent timestamp={schedule.next_execution} />}</td>
              <td>
                {deletingSchedule === schedule ? (
                  <>
                    <button onClick={handleDeleteScheduleConfirm}>Confirm</button>
                    <button onClick={handleCancleDeleteSchedule}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleDeleteSchedule(schedule)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
