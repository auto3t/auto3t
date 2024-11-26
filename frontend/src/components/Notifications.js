import { useCallback, useEffect } from "react";
import useNotificationStore from "../stores/NotificationStore"
import useApi from "../hooks/api";

export default function NotificationBox() {

  const { get } = useApi()
  const {
    showNotifications,
    setShowNotifications,
    notifications, 
    setNotifications,
  } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    const data = await get('actionlog/');
    setNotifications(data.results);
  }, [setNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [showNotifications]);

  const handleHideNotifications = () => {
    setShowNotifications(false);
  }

  return (
    <div>
      {showNotifications && (
        <div className="notifications-outer">
          <div className="notifactions-content">
            <button onClick={handleHideNotifications}>X</button>
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <div className="notification-meta">
                  <span className="tag-item" title={notification.parsed.action}>{notification.action || '-'}</span>
                </div>
                <div>
                  <p>{notification.parsed.content_type}: {notification.parsed.content_item_name}</p>
                  <p>{notification.parsed.message}</p>
                  {notification.comment && (<p>{notification.comment}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
