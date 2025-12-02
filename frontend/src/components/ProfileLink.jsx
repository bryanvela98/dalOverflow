import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProfilePicture from "./ProfilePicture";

export default function ProfileLink() {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const isLoggedIn = useAuth();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Link to="/profile" className="profile-link">
      <ProfilePicture user={userData} size={32} style={{ marginRight: 0 }} />
    </Link>
  );
}
