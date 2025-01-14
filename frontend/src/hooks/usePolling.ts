import { useEffect, useRef, useState } from 'react'

/**
 * usePolling Hook with dynamic interval adjustment and request cancellation on unmount
 * @param callback - The function to call on each polling interval
 * @param initialDelay - Initial polling interval in milliseconds
 * @param dependencies - Dependencies to restart polling when changed
 */
const usePolling = (
  callback: () => Promise<number | void> | void,
  initialDelay: number,
  dependencies: any[] = [],
) => {
  const savedCallback = useRef(callback)
  const [delay, setDelay] = useState<number | null>(initialDelay)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const abortController = new AbortController()

    const tick = async () => {
      try {
        const result = await savedCallback.current()
        if (typeof result === 'number') {
          setDelay(result)
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name !== 'AbortError') {
            console.error('Polling error:', error.message)
          }
        } else {
          console.error('An unexpected error occurred:', error)
        }
      }
    }

    if (delay !== null) {
      tick()
      const id = setInterval(tick, delay)
      return () => {
        clearInterval(id)
        abortController.abort()
      }
    }
  }, [delay, ...dependencies])
}

export default usePolling
