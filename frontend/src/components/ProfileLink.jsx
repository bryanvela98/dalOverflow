import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProfilePicture from "./ProfilePicture";

export default function ProfileLink() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = useAuth();
  const token = localStorage.getItem("token");

  // Show profile link if logged in or have a token (allow null while checking)
  if (isLoggedIn === false && !token) {
    return null;
  }

  return (
    <Link to="/profile" className="profile-link">
      <ProfilePicture user={userData} size={32} style={{ marginRight: 0 }} />
    </Link>
  );
}
