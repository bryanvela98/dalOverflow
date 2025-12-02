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
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="explore">
          <img src="/Explore.png" alt="" srcSet="" className="logo" />
          <p>Explore</p>
        </div>
      </Link>
      <a href="#answers" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="answers">
          <img src="/Answers.png" alt="" srcSet="" className="logo" />
          <p>Answers</p>
        </div>
      </a>
      <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="ai">
          <img src="/AI.png" alt="" srcSet="" className="logo" />
          <p>AI</p>
        </div>
      </Link>
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
      <Link
        to="/questions/create"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="create-forum">
          <img src="/CForum.png" alt="" srcSet="" className="logo" />
          <p>Create Forum</p>
        </div>
      </Link>
      <Link to="/profile" style={{ textDecoration: "none", color: "inherit" }}>
        <div className="manage-forums">
          <img src="/MForum.png" alt="" srcSet="" className="logo" />
          <p>Manage Profile</p>
        </div>
      </Link>
    </div>
  );
}
