import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './AlertNotifications.css';

const AlertNotifications: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="alert-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`alert alert-${notification.type}`}>
          <div className="alert-content">
            <span className="alert-icon">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
              {notification.type === 'info' && 'ℹ'}
            </span>
            <span className="alert-message">{notification.message}</span>
          </div>
          <button
            className="alert-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertNotifications;
