import "../styles/Header.css";

export default function Header() {
  return (
    <div className="contain-header">
      <div className="header-bar">
        <div>
          <p>BRAND</p>
        </div>
        <div className="search-bar">
          <img src="/Search.png" alt="Search" className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <div className="header-buttons">
          <button>Log in</button>

          <button>Sign Up</button>
        </div>
      </div>
    </div>
  );
}
