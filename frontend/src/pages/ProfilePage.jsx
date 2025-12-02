import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import ProfilePicture from "../components/ProfilePicture";
import "../styles/LoginRegistration.css";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const getCurrentUserId = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    let userId = userData.id;
    if (!userId) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split(".")[1]));
          userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.sub;
        } catch (e) {
          console.error("Could not decode token:", e);
        }
      }
    }
    return userId || "1";
  };
  const [userId, setUserId] = useState(getCurrentUserId());
  const navigate = useNavigate();

  useEffect(() => {
    let lastUserId = getCurrentUserId();
    const interval = setInterval(() => {
      const currentUserId = getCurrentUserId();
      if (currentUserId !== lastUserId) {
        setUserId(currentUserId);
        lastUserId = currentUserId;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5001/api/users/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setEditData(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    fetch(`http://localhost:5001/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("PUT response:", data);
        if (data.user) {
          setUser(data.user);
          setEditData(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
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
      <div className="auth-container">
        <div className="form-container" style={{ maxWidth: 420 }}>
          <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            My Profile
          </h2>
          <div
            style={{
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <ProfilePicture
              user={JSON.parse(localStorage.getItem("user") || "{}")}
              size={80}
              style={{ marginBottom: 16 }}
            />
            <div style={{ fontWeight: 600, fontSize: 18 }}>{user.username}</div>
            <div style={{ color: "#555", fontSize: 15 }}>
              {user.email || (
                <span style={{ color: "#f44336" }}>Missing Email</span>
              )}
            </div>
            <div style={{ color: "#555", fontSize: 15 }}>
              {user.display_name || (
                <span style={{ color: "#f44336" }}>Missing Name</span>
              )}
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSave}>
            <h3 style={{ marginBottom: 20, textAlign: "center" }}>
              Edit Your Profile
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                width: "100%",
              }}
            >
              <div className="profile-form-row">
                <label htmlFor="display_name" className="profile-form-label">
                  Display Name
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  className="profile-form-input"
                  placeholder="Display Name"
                  value={editData.display_name || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="profile-form-row">
                <label htmlFor="email" className="profile-form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="profile-form-input"
                  placeholder="Email"
                  value={editData.email || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="profile-form-row">
                <label htmlFor="university" className="profile-form-label">
                  University
                </label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  className="profile-form-input"
                  placeholder="University"
                  value={editData.university || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="profile-form-row">
                <label htmlFor="profile_picture" className="profile-form-label">
                  Profile Picture
                </label>
                <input
                  type="file"
                  id="profile_picture"
                  name="profile_picture"
                  className="profile-form-input"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file); // Fix key to 'file' for backend
                    try {
                      const res = await fetch(
                        "http://localhost:5001/api/upload/profile-picture",
                        {
                          method: "POST",
                          body: formData,
                        }
                      );
                      const data = await res.json();
                      if (data.url) {
                        setEditData((prev) => ({
                          ...prev,
                          profile_picture_url: data.url,
                        }));
                        setUser((prev) => ({
                          ...prev,
                          profile_picture_url: data.url,
                        }));
                        // Optionally update localStorage user object
                        const userObj = JSON.parse(
                          localStorage.getItem("user") || "{}"
                        );
                        userObj.profile_picture_url = data.url;
                        localStorage.setItem("user", JSON.stringify(userObj));
                      }
                    } catch (err) {
                      alert("Failed to upload profile picture.");
                    }
                  }}
                />
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ marginTop: 24 }}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
