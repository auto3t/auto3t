import { useCallback, useEffect, useRef } from 'react'
import useNotificationStore from '../stores/NotificationStore'
import useApi from '../hooks/api'
import TimeComponent from './TimeComponent'
import { LucideIconWrapper, P, StyledLink, TagItem } from './Typography'

type NotificationParsedType = {
  action: string
  content_type: string
  content_item_name: string
  url: string
  message: string
}

export type NotificationType = {
  id: number
  action: string
  timestamp: string
  comment: string
  parsed: NotificationParsedType
}

export default function NotificationBox() {
  const { get } = useApi()
  const {
    showNotifications,
    setShowNotifications,
    notifications,
    setNotifications,
  } = useNotificationStore()

  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await get('actionlog/')
      setNotifications(data.results)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [setNotifications])

  useEffect(() => {
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(async () => {
        await fetchNotifications()
        startPolling()
      }, 5000)
    }

    if (showNotifications) {
      fetchNotifications()
      startPolling()
    }

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
        pollingTimeoutRef.current = null
      }
    }
  }, [showNotifications, fetchNotifications])

  const handleHideNotifications = () => {
    setShowNotifications(false)
  }

  return (
    <div>
      {showNotifications && (
        <div className="fixed right-0 bottom-0 z-10 h-120 max-w-300 bg-main-fg p-2">
          <LucideIconWrapper
            name="X"
            onClick={handleHideNotifications}
            className="cursor-pointer mb-2"
          />
          <div className="overflow-scroll h-100 pr-2">
            {notifications.map((notification) => (
              <div
                key={notification.id.toString()}
                className="bg-main-bg mb-2 p-2 flex items-center"
              >
                <TagItem className="mr-2" title={notification.parsed.action}>
                  {notification.action || '-'}
                </TagItem>
                <div>
                  {notification.parsed.url ? (
                    <>
                      <StyledLink to={notification.parsed.url}>
                        {notification.parsed.content_type}:{' '}
                        {notification.parsed.content_item_name}
                      </StyledLink>
                      <br />
                    </>
                  ) : (
                    <P>
                      {notification.parsed.content_type}:{' '}
                      {notification.parsed.content_item_name || 'Unavailable'}
                    </P>
                  )}
                  <P>
                    <TimeComponent timestamp={notification.timestamp} />
                  </P>
                  {notification.parsed.message && (
                    <P>{notification.parsed.message}</P>
                  )}
                  {notification.comment && <P>{notification.comment}</P>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
