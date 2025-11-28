import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/Header.css";
import NotificationBell from "../NotificationBell/NotificationBell";
import Login from "../LogInButton";

export default function Header() {
  // 删除所有通知相关的状态和函数
  // NotificationBell 组件会自己管理这些

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
          {/* 使用完整的 NotificationBell 组件 */}
          <NotificationBell /> {/* ← 改成这个 */}
          {/* <button>Log in</button> */}
          <Login />
        </div>
      </div>
    </div>
  );
}
