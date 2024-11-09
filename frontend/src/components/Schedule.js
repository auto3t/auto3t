import { useCallback, useEffect } from "react";
import useApi from "../hooks/api"
import useScheduleStore from "../stores/ScheduleStore";

export default function Schedule() {

  const { get } = useApi();

  const { schedules, setSchedules } = useScheduleStore();

  const fetchSchedules = useCallback(async () => {
    const data = await get('scheduler/');
    setSchedules(data);
  }, [setSchedules]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return (
    <>
      <h2>Schedule</h2>
      {schedules.map((schedule) => (
        <p>{schedule.job_display}</p>
      ))}
    </>
  )
}
