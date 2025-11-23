import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useProgressStore } from '../stores/ProgressStore'
import useApi from '../hooks/api'
import { LucideIconWrapper, P } from './Typography'

interface Props {
  pollingInterval?: number
}

export default function ProgressIndicator({ pollingInterval = 3000 }: Props) {
  const { get } = useApi()
  const location = useLocation()

  const pendingJobs = useProgressStore((state) => state.pendingJobs)
  const hadPendingJobs = useProgressStore((state) => state.hadPendingJobs)
  const refetch = useProgressStore((state) => state.refetch)
  const isPolling = useProgressStore((state) => state.isPolling)
  const setIsPolling = useProgressStore((state) => state.setIsPolling)
  const setPendingJobs = useProgressStore((state) => state.setPendingJobs)
  const resetHadPendingJobs = useProgressStore(
    (state) => state.resetHadPendingJobs,
  )

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkProgress = async () => {
      try {
        const data = await get('progress/')
        setPendingJobs(data.pending_jobs)
      } catch (error) {
        console.error('Error fetching progress on navigation:', error)
      }
    }

    checkProgress()
  }, [location.pathname, setPendingJobs])

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await get('progress/')
        setPendingJobs(data.pending_jobs)
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    const checkPolling = async () => {
      await fetchProgress()
      if (pendingJobs > 0 && !intervalRef.current) {
        intervalRef.current = setInterval(fetchProgress, pollingInterval)
      }

      if (pendingJobs === 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      if (isPolling) setIsPolling(false)
    }

    checkPolling()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [pendingJobs, pollingInterval, setPendingJobs, isPolling])

  const showRefresh = pendingJobs === 0 && hadPendingJobs

  return (
    <div className="flex items-center">
      {pendingJobs > 0 ? (
        <div
          className="bg-main-fg flex items-center gap-2 py-1 px-3 rounded-md"
          title={`${pendingJobs} jobs are processing...`}
        >
          <P variant="alert">{pendingJobs}</P>
          <LucideIconWrapper
            className="animate-spin ml-2"
            size={18}
            name="Hourglass"
          />
        </div>
      ) : showRefresh ? (
        <div
          onClick={() => {
            refetch()
            resetHadPendingJobs()
          }}
          className="cursor-pointer bg-main-fg py-1 px-3 rounded-md"
          title="Jobs have completed, refresh interface."
        >
          <LucideIconWrapper size={18} name="RotateCcw" />
        </div>
      ) : null}
    </div>
  )
}
