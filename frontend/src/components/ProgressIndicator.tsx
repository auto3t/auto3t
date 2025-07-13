import { useEffect, useCallback } from 'react'
import { useProgressStore } from '../stores/ProgressStore'
import useApi from '../hooks/api'
import { P } from './Typography'

export default function ProgressIndicator({
  setRefresh,
}: {
  setRefresh?: () => void
}) {
  const { get } = useApi()
  const pendingJobs = useProgressStore((s) => s.pendingJobs)
  const isProcessing = useProgressStore((s) => s.isProcessing)
  const setPendingJobs = useProgressStore((s) => s.setPendingJobs)
  const startPolling = useProgressStore((s) => s.startPolling)
  const stopPolling = useProgressStore((s) => s.stopPolling)

  const fetchProgress = useCallback(async () => {
    try {
      const data = await get('progress/')
      const count = data.pending_jobs ?? 0
      setPendingJobs(count)

      if (count > 0 && setRefresh) {
        setRefresh() // optional: trigger custom logic
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err)
    }
  }, [setPendingJobs, setRefresh])

  useEffect(() => {
    startPolling()
    fetchProgress() // fetch immediately

    const handlePoll = () => fetchProgress()
    window.addEventListener('progress:poll', handlePoll)

    return () => {
      stopPolling()
      window.removeEventListener('progress:poll', handlePoll)
    }
  }, [fetchProgress, startPolling, stopPolling])

  return (
    <div className="flex items-center justify-center">
      {pendingJobs > 0 && <P>{pendingJobs}</P>}
      <div
        className={`transition-transform duration-500 ${
          isProcessing ? 'animate-spin' : ''
        }`}
        title={isProcessing ? `${pendingJobs} tasks running` : 'Idle'}
      >
        <span className="p-2">⏳</span>
      </div>
    </div>
  )
}
