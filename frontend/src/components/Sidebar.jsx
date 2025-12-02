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
      <div className="explore">
        <img src="/Explore.png" alt="" srcSet="" className="logo" />
        <p>Explore</p>
      </div>
      <div className="answers">
        <img src="/Answers.png" alt="" srcSet="" className="logo" />
        <p>Answers</p>
      </div>
      <div className="ai">
        <img src="/AI.png" alt="" srcSet="" className="logo" />
        <p>AI</p>
      </div>
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
      <div className="create-forum">
        <img src="/CForum.png" alt="" srcSet="" className="logo" />
        <p>Create Forum</p>
      </div>
      <div className="manage-forums">
        <img src="/MForum.png" alt="" srcSet="" className="logo" />
        <p>Manage Forums</p>
      </div>
    </div>
  );
}
