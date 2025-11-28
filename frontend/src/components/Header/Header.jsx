import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/Header.css";
import NotificationBell from "../NotificationBell/NotificationBell";
import Login from "../LogInButton";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || "1";
    fetch(`http://localhost:5001/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="contain-header">
      <div className="header-bar">
        <div>
          <Link to="/" className="brand-link">
            <p>DalOverflow</p>
          </Link>
        </div>

        <div className="search-bar">
          <img src="/Search.png" alt="Search" className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        <div className="header-buttons">
          <NotificationBell />
          <Link to="/profile" className="profile-link">
            <img
              src={user?.profile_picture_url || ""}
              alt="Profile"
              className="profile-icon"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Link>
          <Login />
        </div>
      </div>
    </div>
  );
}
