import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Replace with actual user ID fetch logic (e.g., from auth context, localStorage, etc.)
    const userId = localStorage.getItem("user_id") || "1"; // fallback to 1 for demo
    fetch(`http://localhost:5001/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setEditData(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const userId = localStorage.getItem("user_id") || "1";
    fetch(`http://localhost:5001/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("PUT response:", data);
        setUser(data.user);
        setSaving(false);
      })
      .catch((err) => {
        console.error("PUT error:", err);
        setSaving(false);
      });
  };

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>User not found.</div>;

  // List of required fields
  const requiredFields = ["display_name", "email", "profile_picture_url"];
  const missingFields = requiredFields.filter((field) => !user[field]);

  return (
    <>
      <Header />
      <div
        style={{
          maxWidth: 600,
          margin: "2rem auto",
          padding: "2rem",
          background: "#fff",
          borderRadius: 8,
        }}
      >
        <h2>My Profile</h2>
        <div style={{ marginBottom: "2rem" }}>
          <img
            src={
              user.profile_picture_url ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(user.display_name || user.username)
            }
            alt="Profile"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: 16,
            }}
          />
          <div>
            <strong>Username:</strong> {user.username}
          </div>
          <div>
            <strong>Email:</strong>{" "}
            {user.email || <span style={{ color: "#f44336" }}>Missing</span>}
          </div>
          <div>
            <strong>Display Name:</strong>{" "}
            {user.display_name || (
              <span style={{ color: "#f44336" }}>Missing</span>
            )}
          </div>
        </div>
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <h3>Edit Your Profile</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label htmlFor="display_name" style={{ minWidth: 100 }}>
              <strong>Display Name:</strong>
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              placeholder="Display Name"
              value={editData.display_name || ""}
              onChange={handleChange}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label htmlFor="email" style={{ minWidth: 100 }}>
              <strong>Email:</strong>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={editData.email || ""}
              onChange={handleChange}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label htmlFor="university" style={{ minWidth: 100 }}>
              <strong>University:</strong>
            </label>
            <input
              type="text"
              id="university"
              name="university"
              placeholder="University"
              value={editData.university || ""}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#ffc107",
              color: "#212121",
              padding: "0.75rem",
              borderRadius: 6,
              border: "none",
              fontWeight: 600,
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfilePage;
