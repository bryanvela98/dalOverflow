import React, { useEffect, useState } from "react";
import apiFetch from "../utils/api";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import RightBar from "../components/RightBar";
import API_BASE_URL from "../constants/apiConfig";
import "../styles/UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("username");

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        // console.log("All user information:", data.users);
        setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fuzzy search function
  function fuzzyMatch(str, query) {
    if (!str || !query) return false;
    str = str.toLowerCase();
    query = query.toLowerCase();
    let queryIdx = 0;
    for (let i = 0; i < str.length && queryIdx < query.length; i++) {
      if (str[i] === query[queryIdx]) {
        queryIdx++;
      }
    }
    return queryIdx === query.length;
  }

  const filteredUsers =
    search.trim() === ""
      ? users
      : users.filter(
          (user) =>
            fuzzyMatch(user.username, search) || fuzzyMatch(user.email, search)
        );

  let sortedUsers = [...filteredUsers];
  if (sortBy === "username") {
    sortedUsers.sort((a, b) => a.username.localeCompare(b.username));
  } else if (sortBy === "reputation") {
    sortedUsers.sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
  } else if (sortBy === "registration_date") {
    sortedUsers.sort(
      (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
    );
  } else if (sortBy === "new_users") {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    sortedUsers = sortedUsers.filter(
      (user) => new Date(user.registration_date) >= sevenDaysAgo
    );
    sortedUsers.sort(
      (a, b) => new Date(b.registration_date) - new Date(a.registration_date)
    );
  }

  // { value: "reputation", label: "Reputation" },
  // { value: "registration_date", label: "Registration Date" },

  return (
    <div className="background-page">
      <Header />
      <div className="major-body">
        <Sidebar />
        <div className="main-body">
          <div className="centre-body">
            <h2 className="users-page-title">USERS</h2>
            <input
              type="text"
              placeholder="Search by username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="user-search-bar"
            />
            <div className="user-sort-bar">
              {[
                { value: "username", label: "Username" },
                { value: "new_users", label: "New Users (Last 7 Days)" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`user-sort-option${
                    sortBy === option.value ? " active" : ""
                  }`}
                  onClick={() => setSortBy(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="users-list">
                {sortedUsers.map((user) => (
                  <div key={user.id} className="user-tile">
                    <div className="user-tile-row">
                      <img
                        src={
                          (user.id ===
                          JSON.parse(localStorage.getItem("user") || "{}").id
                            ? JSON.parse(localStorage.getItem("user") || "{}")
                                .profile_picture_url
                            : user.profile_picture_url) ||
                          "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(user.username)
                        }
                        alt={user.username + " profile"}
                        className="user-profile-pic"
                      />
                      <div className="user-tile-info">
                        <div>{user.display_name || user.username}</div>
                        <div>{user.reputation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <RightBar />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
