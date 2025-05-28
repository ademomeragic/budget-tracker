import React, { useEffect, useState } from "react";
import { fetchNotifications, deleteNotification } from "../../api/api";
import "./NotificationList.css";
interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    const data = await fetchNotifications();
    setNotifications(data);
  };

  const handleMarkAsRead = async (id: number) => {
    await deleteNotification(id);
    loadNotifications();
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="notification-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`notification-item ${n.isRead ? "read" : "unread"}`}
            >
              <span>{n.message}</span>
              <span className="timestamp">
                {new Date(n.createdAt).toLocaleString()}
              </span>
              {!n.isRead && (
                <button onClick={() => handleMarkAsRead(n.id)}>Mark as read</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;
