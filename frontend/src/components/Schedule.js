import { useCallback, useEffect } from "react";
import useApi from "../hooks/api"
import useScheduleStore from "../stores/ScheduleStore";
import TimeComponent from "./TimeComponent";

export default function Schedule() {

  const { get, del } = useApi();

  const {
    schedules,
    setSchedules,
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

  return (
    <>
      <h2>Schedule</h2>
      <table className="keyword-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Schedule</th>
            <th>Next Execution</th>
            <th><button>Add</button></th>
          </tr>
        </thead>
        <tbody>
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
                    <button>Edit</button>
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
