import React, { useState, useRef, useEffect } from 'react';
import './NotificationDropdown.css';

/**
 * Notification Dropdown Component
 * 
 * 
 * Props:
 * @param {Array} notifications - Notification List
 * @param {Function} onNotificationClick - Click notification callback
 * @param {Function} onMarkAsRead - Marked as read callback
 * @param {Function} onMarkAllAsRead - Mark all callbacks as read
 * @param {number} unreadCount - Number of Unread Notifications
 */
const NotificationDropdown = ({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  unreadCount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click the external close dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setIsOpen(false);
  };

  const handleMarkAsRead = (notificationId, event) => {
    event.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const formatTimeAgo = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return dateObj.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'answer':
        return '💬';
      case 'comment':
        return '💭';
      case 'vote':
        return '👍';
      case 'accepted':
        return '✅';
      case 'mention':
        return '@';
      default:
        return '🔔';
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        className="notification-bell"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">📭</span>
                <p>No notifications yet</p>
                <span className="empty-hint">
                  When you get notifications, they'll show up here
                </span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.isRead ? 'notification-read' : 'notification-unread'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-content">
                    <div className="notification-text">
                      <span className="notification-user">
                        {notification.userName}
                      </span>
                      {' '}
                      <span className="notification-action">
                        {notification.action}
                      </span>
                      {' '}
                      <span className="notification-target">
                        {notification.target}
                      </span>
                    </div>

                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {notification.questionTitle && (
                        <span className="notification-question">
                          "{notification.questionTitle}"
                        </span>
                      )}
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      className="mark-read-btn"
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      aria-label="Mark as read"
                    >
                      <span className="unread-dot"></span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <a href="/notifications" className="view-all-link">
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
