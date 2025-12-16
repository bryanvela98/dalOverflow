import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

export default function Sidebar() {
  return (
    <div className="nav-bar">
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="home">
          <img src="/Home.png" alt="" srcSet="" className="logo" />
          <p>Home</p>
        </div>
      </Link>

      <a href="/users" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="answers">
          <img src="/Answers.png" alt="" srcSet="" className="logo" />
          <p>Users</p>
        </div>
      </a>

      <hr />
      <Link
        to="/categories"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="categories">
          <img src="/Categories.png" alt="" srcSet="" className="logo" />
          <p>Categories</p>
        </div>
      </Link>
      <hr />

      <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="manage-forums">
          <img src="/MForum.png" alt="" srcSet="" className="logo" />
          <p>Manage Profile</p>
        </div>
      </Link>
    </div>
  );
}
