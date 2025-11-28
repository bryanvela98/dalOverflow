import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/Header.css";
import NotificationBell from "../NotificationBell/NotificationBell";
import Login from "../LogInButton";

export default function Header() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

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
              src={userData.profile_picture_url || ""}
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
