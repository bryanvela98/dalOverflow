import { useState, useEffect } from "react";
import ProfilePicture from "../ProfilePicture";
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
            <ProfilePicture
              user={userData}
              size={32}
              style={{ marginRight: 0 }}
            />
          </Link>
          <Login />
        </div>
      </div>
    </div>
  );
}
