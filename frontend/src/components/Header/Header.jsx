import { useState, useEffect } from "react";
import apiFetch from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../styles/Header.css";
import NotificationBellContainer from "../NotificationBellContainer";
import ProfileLink from "../ProfileLink";
import Login from "../LogInButton";
import API_BASE_URL from "../../constants/apiConfig";

export default function Header() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Fetch suggestions when user types 3+ characters
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      setIsLoadingSuggestions(true);
      const fetchSuggestions = async () => {
        try {
          const response = await apiFetch(
            `${API_BASE_URL}/questions/search?query=${encodeURIComponent(
              searchQuery
            )}`
          );
          const data = await response.json();
          setSuggestions(data.results?.slice(0, 5) || []);
          setShowSuggestions(true);
        } catch (error) {
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };

      const debounceTimer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length === 0) {
      alert("Please enter a keyword to search.");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (questionId) => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/questions/${questionId}`);
  };
  return (
    <div className="contain-header">
      <div className="header-bar">
        <div>
          <Link to="/" className="brand-link">
            <p>DalOverflow</p>
          </Link>
        </div>

        <form className="search-bar-wrapper" onSubmit={handleSearch}>
          <div className="search-bar">
            <img src="/Search.png" alt="Search" className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {isLoadingSuggestions && (
                <div className="suggestion-loading">Loading...</div>
              )}
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion.id)}
                >
                  <img
                    src="/Search.png"
                    alt="Search"
                    className="suggestion-icon"
                  />
                  <div className="suggestion-content">
                    <div className="suggestion-title">{suggestion.title}</div>
                    <div className="suggestion-meta">
                      {suggestion.answerCount || 0} answers •{" "}
                      {suggestion.voteCount || 0} votes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSuggestions &&
            suggestions.length === 0 &&
            !isLoadingSuggestions && (
              <div className="search-suggestions">
                <div className="no-suggestions">No suggestions available</div>
              </div>
            )}
        </form>

        <div className="header-buttons">
          <NotificationBellContainer />
          <ProfileLink />
          <Login />
        </div>
      </div>
    </div>
  );
}
