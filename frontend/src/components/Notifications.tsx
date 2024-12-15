import { useCallback, useEffect, useRef } from "react";
import useNotificationStore from "../stores/NotificationStore";
import useApi from "../hooks/api";
import TimeComponent from "./TimeComponent";
import { Link } from "react-router-dom";

type NotificationParsedType = {
  action: string
  content_type: string
  content_item_name: string
  url: string
  message: string
}

export type NotificationType = {
  id: Number
  action: string
  timestamp: string
  comment: string
  parsed: NotificationParsedType
}

export default function NotificationBox() {
  const { get } = useApi();
  const {
    showNotifications,
    setShowNotifications,
    notifications,
    setNotifications,
  } = useNotificationStore();

  const pollingTimeoutRef: any = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await get("actionlog/");
      setNotifications(data.results);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [setNotifications]);

  useEffect(() => {
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(async () => {
        await fetchNotifications();
        startPolling();
      }, 5000);
    };

    if (showNotifications) {
      fetchNotifications();
      startPolling();
    }

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    };
  }, [showNotifications, fetchNotifications]);

  const handleHideNotifications = () => {
    setShowNotifications(false);
  };

  return (
    <div>
      {showNotifications && (
        <div className="notifications-outer">
          <div className="notifactions-content">
            <button onClick={handleHideNotifications}>X</button>
            {notifications.map((notification) => (
              <div key={notification.id.toString()} className="notification-item">
                <div className="notification-meta">
                  <span className="tag-item" title={notification.parsed.action}>
                    {notification.action || "-"}
                  </span>
                </div>
                <div>
                  {notification.parsed.url ? (
                    <Link to={notification.parsed.url}>
                      <p>
                        {notification.parsed.content_type}:{" "}
                        {notification.parsed.content_item_name}
                      </p>
                    </Link>
                  ) : (
                    <p>
                      {notification.parsed.content_type}:{" "}
                      {notification.parsed.content_item_name || "Unavailable"}
                    </p>
                  )}
                  <TimeComponent timestamp={notification.timestamp} />
                  <p>{notification.parsed.message}</p>
                  {notification.comment && <p>{notification.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
