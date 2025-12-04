import React, { useState, useEffect, useRef } from "react";
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

          const response = await fetch(
            `${API_BASE_URL}/notifications/${currentUserId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch notifications");
          }
          const data = await response.json();
          // Change according to your backend response format
          setNotifications(data.notifications || []);
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
          style={{ color: "#6b7280" }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {/* 未读数量徽章 */}
        <span
          style={{
            position: "absolute",
            top: "2px",
            right: "2px",
            background: "#ef4444",
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
          2
        </span>
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
              background: "white",
              border: "2px solid #3b82f6",
              borderRadius: "12px",
              padding: "24px",
              width: "380px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
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
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#1f2937",
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
                  background: "#fee2e2",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#dc2626",
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
              <div
                style={{
                  padding: "16px",
                  background: "#f9fafb",
                  borderRadius: "10px",
                  cursor: "pointer",
                  borderLeft: "5px solid #d1d5db",
                  opacity: 0.7,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.7";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    color: "#4b5563",
                    marginBottom: "8px",
                    fontSize: "15px",
                  }}
                >
                  👍 Your answer received 5 upvotes
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "8px",
                    lineHeight: "1.5",
                  }}
                >
                  "JavaScript async/await tutorial"
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  2 hours ago
                </div>
              </div>

              <div>
                {loading && <div>Loading...</div>}
                {error && (
                  <div style={{ color: "red", marginBottom: "12px" }}>
                    {error}
                  </div>
                )}

                {notifications.length === 0 && !loading ? (
                  <div style={{ color: "#6b7280", padding: "16px" }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification, idx) => (
                    <div
                      key={notification.id || idx}
                      style={{
                        padding: "16px",
                        background: notification.unread
                          ? "linear-gradient(to right, #dbeafe, #eff6ff)"
                          : "#f9fafb",
                        borderRadius: "10px",
                        marginBottom: "12px",
                        cursor: "pointer",
                        borderLeft: `5px solid ${
                          notification.unread ? "#3b82f6" : "#d1d5db"
                        }`,
                        opacity: notification.unread ? 1 : 0.7,
                        transition: "all 0.2s",
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
                          color: "#1f2937",
                          marginBottom: "8px",
                          fontSize: "15px",
                        }}
                      >
                        {notification.header}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#4b5563",
                          marginBottom: "8px",
                          lineHeight: "1.5",
                        }}
                      >
                        {notification.body}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
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
            <div
              style={{
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "2px solid #e5e7eb",
                display: "flex",
                gap: "12px",
              }}
            >
              <button
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Mark all as read
              </button>
              <button
                onClick={() => (window.location.href = "/notifications")}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "white",
                  color: "#3b82f6",
                  border: "2px solid #3b82f6",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                View all
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default NotificationBell;
