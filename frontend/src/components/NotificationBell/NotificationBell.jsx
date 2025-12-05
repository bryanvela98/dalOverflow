import React, { useState, useEffect, useRef } from "react";
import apiFetch from "../../utils/api";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../../constants/apiConfig";

const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();
  const readNotificationsKey = "readNotifications";

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (!stored) {
          return;
        }
        const currentUser = JSON.parse(stored);
        const currentUserId = currentUser.id;

        const response = await apiFetch(
          `${API_BASE_URL}/notifications/${currentUserId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        // Load read notifications from localStorage
        const readNotifs = JSON.parse(
          localStorage.getItem(readNotificationsKey) || "[]"
        );
        // Mark notifications as read if they're in the read list
        const notificationsWithReadState = (data.notifications || []).map(
          (notif) => ({
            ...notif,
            unread: !readNotifs.includes(notif.id),
          })
        );
        // Sort by newest first (reverse order)
        notificationsWithReadState.reverse();
        setNotifications(notificationsWithReadState);
      } catch (err) {
        console.error("Could not load notifications");
      }
    };

    fetchNotifications();
  }, []);

  // 计算下拉框位置
  useEffect(() => {
    // if (showDropdown && buttonRef.current) {
    //   const rect = buttonRef.current.getBoundingClientRect();
    //   setDropdownPosition({
    //     top: rect.bottom + 8,
    //     right: window.innerWidth - rect.right,
    //   });
    // }
    if (showDropdown) {
      const fetchNotifications = async () => {
        setLoading(true);
        setError("");
        try {
          const stored = localStorage.getItem("user");
          if (!stored) {
            setError("Not logged in: no user in storage");
            setLoading(false);
            return;
          }
          const currentUser = JSON.parse(stored);
          const currentUserId = currentUser.id;

          const response = await apiFetch(
            `${API_BASE_URL}/notifications/${currentUserId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch notifications");
          }
          const data = await response.json();
          // Load read notifications from localStorage
          const readNotifs = JSON.parse(
            localStorage.getItem(readNotificationsKey) || "[]"
          );
          // Mark notifications as read if they're in the read list
          const notificationsWithReadState = (data.notifications || []).map(
            (notif) => ({
              ...notif,
              unread: !readNotifs.includes(notif.id),
            })
          );
          // Sort by newest first (reverse order)
          notificationsWithReadState.reverse();
          setNotifications(notificationsWithReadState);
        } catch (err) {
          setError("Could not load notifications");
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [showDropdown]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        const dropdown = document.getElementById("notification-dropdown");
        if (dropdown && !dropdown.contains(event.target)) {
          setShowDropdown(false);
        }
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const handleClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, unread: false } : notif
      )
    );
    // Save to localStorage
    const readNotifs = JSON.parse(
      localStorage.getItem(readNotificationsKey) || "[]"
    );
    if (!readNotifs.includes(notificationId)) {
      readNotifs.push(notificationId);
      localStorage.setItem(readNotificationsKey, JSON.stringify(readNotifs));
    }
  };

  return (
    <>
      {/* 铃铛按钮 */}
      <button
        ref={buttonRef}
        onClick={handleClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* SVG 铃铛图标 */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {/* 未读数量徽章 */}
        {notifications.filter((n) => n.unread).length > 0 && (
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              background: "var(--color-danger)",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            {notifications.filter((n) => n.unread).length}
          </span>
        )}
      </button>

      {/* 下拉菜单 - 使用 Portal 挂载到 body */}
      {showDropdown &&
        createPortal(
          <div
            id="notification-dropdown"
            style={{
              position: "fixed",
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
              background: "var(--color-bg-primary)",
              border: "2px solid var(--color-primary)",
              borderRadius: "12px",
              padding: "24px",
              width: "380px",
              boxShadow: "var(--shadow-lg)",
              zIndex: 9999999,
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "var(--color-text-primary)",
                  fontSize: "20px",
                  fontWeight: "700",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    display: "inline-block",
                    verticalAlign: "middle",
                    marginRight: "8px",
                  }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Notifications
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                style={{
                  background: "var(--color-primary-light)",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "var(--color-danger)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>

            {/* Notifications List */}
            <div>
              {/* Unread Notification 1 */}
              {/* <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(to right, #dbeafe, #eff6ff)',
              borderRadius: '10px',
              marginBottom: '12px',
              cursor: 'pointer',
              borderLeft: '5px solid #3b82f6',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            > */}
              {/* <div style={{ 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '8px',
                fontSize: '15px',
              }}>
                💬 New answer to your question
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#4b5563', 
                marginBottom: '8px',
                lineHeight: '1.5',
              }}>
                "How to implement authentication in Flask?"
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>by John Doe</span>
                <span>5 min ago</span>
              </div>
            </div>

            {/* Unread Notification 2 */}
              {/* <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(to right, #dbeafe, #eff6ff)',
              borderRadius: '10px',
              marginBottom: '12px',
              cursor: 'pointer',
              borderLeft: '5px solid #3b82f6',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{ 
                fontWeight: '700', 
                color: '#1f2937', 
                marginBottom: '8px',
                fontSize: '15px',
              }}>
                💭 New comment on your answer
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#4b5563', 
                marginBottom: '8px',
                lineHeight: '1.5',
              }}>
                "Great explanation! Thanks for the help."
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>by Jane Smith</span>
                <span>30 min ago</span>
              </div>
            </div> */}

              {/* Read Notification */}

              <div>
                {loading && <div>Loading...</div>}
                {error && (
                  <div
                    style={{
                      color: "var(--color-danger)",
                      marginBottom: "12px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {notifications.length === 0 && !loading ? (
                  <div
                    style={{
                      color: "var(--color-text-secondary)",
                      padding: "16px",
                    }}
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification, idx) => (
                    <div
                      key={notification.id || idx}
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        padding: "16px",
                        background: notification.unread
                          ? "linear-gradient(to right, var(--color-primary-light), var(--color-bg-secondary))"
                          : "var(--color-bg-tertiary)",
                        borderRadius: "10px",
                        marginBottom: "12px",
                        cursor: "pointer",
                        borderLeft: `5px solid ${
                          notification.unread
                            ? "var(--color-primary)"
                            : "var(--color-border-light)"
                        }`,
                        opacity: notification.unread ? 1 : 0.7,
                        transition: "all var(--transition-base)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateX(4px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateX(0)")
                      }
                    >
                      <div
                        style={{
                          fontWeight: "700",
                          color: "var(--color-text-primary)",
                          marginBottom: "8px",
                          fontSize: "15px",
                        }}
                      >
                        {notification.header}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "var(--color-text-secondary)",
                          marginBottom: "8px",
                          lineHeight: "1.5",
                        }}
                      >
                        {notification.body}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--color-text-tertiary)",
                        }}
                      >
                        {notification.created_at}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
          </div>,
          document.body
        )}
    </>
  );
};

export default NotificationBell;
