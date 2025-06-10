import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/api'
import useScheduleStore from '../../stores/ScheduleStore'
import TimeComponent from '../TimeComponent'
import { Button, H2, Input, Select, Table } from '../Typography'

export type SchedulerType = {
  id: number
  job_display: string
  cron_schedule: string
  next_execution: string
}

type TaskType = {
  id: number
  job: string
  name: string
  queue: string
}

type taskMessageType = {
  [key: string]: string
}

export default function Schedule() {
  const { error, get, post, del } = useApi()
  const [taskMessage, setTaskMessage] = useState<taskMessageType>({})

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
  } = useScheduleStore()

  const [tasks, setTasks] = useState<TaskType[]>([])

  const fetchSchedules = useCallback(async () => {
    const data = await get('scheduler/')
    setSchedules(data)
  }, [setSchedules])

  const fetchTasks = useCallback(async () => {
    const data = await get('tasks/')
    setTasks(data)
  }, [setTasks])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDeleteSchedule = (schedule: SchedulerType) => {
    setDeletingSchedule(schedule)
  }

  const handleCancleDeleteSchedule = () => {
    setDeletingSchedule(null)
  }

  const handleDeleteScheduleConfirm = async () => {
    if (!deletingSchedule) return
    try {
      const data = await del(`scheduler/${deletingSchedule.id}/`)
      if (data) {
        setDeletingSchedule(null)
        fetchSchedules()
      } else {
        console.error('Failed to delete schedule')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  const handleShowAddForm = () => {
    setCreateSchedule(true)
  }

  const handleCancleCreate = () => {
    setCreateSchedule(false)
    setSelectedSchedule('')
    setNewSchedule('')
  }

  const handleCreateSchedule = async () => {
    try {
      const body = {
        job: selectedSchedule,
        cron_schedule: newSchedule,
      }
      const data = await post('scheduler/', body)
      if (data) {
        handleCancleCreate()
        fetchSchedules()
      } else {
        console.error('Failed to create schedule')
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error creating keyword:', err.message)
      } else {
        console.error('An unknown error creating keyword')
      }
    }
  }

  const handleRunTask = async (task: TaskType) => {
    try {
      const body = { job: task.job }
      const data = await post('tasks/', body)
      if (data) {
        setTaskMessage({ [task.job]: 'new task started' })
      } else {
        console.error('Failed to create task')
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error creating keyword:', err.message)
      } else {
        console.error('An unknown error creating keyword')
      }
    }
  }

  const scheduleHeaders = [
    'Name',
    'Schedule',
    'Next Execution',
    createSchedule === true ? (
      <Button onClick={handleCancleCreate}>Cancel</Button>
    ) : (
      <Button onClick={handleShowAddForm}>Add</Button>
    ),
  ]

  const scheduleRowsHead: (string | number | React.ReactNode)[][] = []
  if (createSchedule === true) {
    scheduleRowsHead.push([
      <Select
        value={selectedSchedule}
        onChange={(e) => setSelectedSchedule(e.target.value)}
        key="create-schedule-select"
      >
        <option value="">Select Schedule</option>
        {tasks.length > 0 &&
          tasks.map((task) => (
            <option value={task.job} key={task.id}>
              {task.name}
            </option>
          ))}
      </Select>,
      <Input
        type="text"
        value={newSchedule}
        onChange={(e) => setNewSchedule(e.target.value)}
        placeholder="Enter Cron Schedule"
        key="create-schedule-cron"
      />,
      '',
      <>
        <Button onClick={handleCreateSchedule}>Create Schedule</Button>
        <Button className="ml-2" onClick={handleCancleCreate}>
          Cancel
        </Button>
      </>,
    ])
  }

  const scheduleRows = scheduleRowsHead.concat(
    schedules.map((schedule) => [
      schedule.job_display,
      schedule.cron_schedule,
      <TimeComponent
        timestamp={schedule.next_execution}
        key={`schedule-next-exec-${schedule.id}`}
      />,
      deletingSchedule === schedule ? (
        <>
          <Button onClick={handleDeleteScheduleConfirm}>Confirm</Button>
          <Button className="ml-2" onClick={handleCancleDeleteSchedule}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => handleDeleteSchedule(schedule)}>Delete</Button>
        </>
      ),
    ]),
  )

  const taskHeaders = ['Task', 'Message', '']

  const taskRows = tasks.map((task) => [
    task.name,
    taskMessage[task.job] ? taskMessage[task.job] : '',
    <Button onClick={() => handleRunTask(task)} key={`task-run-${task.id}`}>
      Run
    </Button>,
  ])

  return (
    <>
      <H2>Schedule</H2>
      {error && <p>Error: {error}</p>}
      <Table rows={scheduleRows} headers={scheduleHeaders} />
      <div className="pt-4">
        <H2>Tasks</H2>
        <Table rows={taskRows} headers={taskHeaders} />
      </div>
    </>
  )
}
