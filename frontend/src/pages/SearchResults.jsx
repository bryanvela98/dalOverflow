import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import RightBar from "../components/RightBar";
import "../styles/SearchResults.css";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");

  const resultsPerPage = 10;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  useEffect(() => {
    if (!query.trim()) {
      setError("Please enter a keyword to search.");
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5001/api/questions/search?query=${encodeURIComponent(
            query
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        console.log("Full response:", data);
        setResults(data.results || []);
        setTotalResults(data.results?.length || 0);
        console.log("Search results:", data.results);
      } catch (err) {
        console.error("Search error:", err);
        setError(
          "Something went wrong while loading results. Please try again later."
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Fetch full question details for each result
  useEffect(() => {
    if (results.length === 0) return;

    const fetchFullDetails = async () => {
      try {
        const enrichedResults = await Promise.all(
          results.map(async (question) => {
            try {
              const response = await fetch(
                `http://localhost:5001/api/questions/${question.id}`
              );
              if (response.ok) {
                const data = await response.json();
                return { ...question, ...data.question };
              }
            } catch (err) {
              console.error(
                `Error fetching details for question ${question.id}:`,
                err
              );
            }
            return question;
          })
        );
        setResults(enrichedResults);
      } catch (err) {
        console.error("Error enriching results:", err);
      }
    };

    fetchFullDetails();
  }, [results.length > 0 ? results[0]?.id : null]);

  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateRange("all");
    setSortBy("relevance");
    setCurrentPage(1);
  };

  const getDatePosted = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!query.trim()) {
    return (
      <div className="background-page">
        <Header />
        <div className="major-body">
          <Sidebar />
          <div className="main-body">
            <div className="search-results-container">
              <div className="error-message">
                Please enter a keyword to search.
              </div>
            </div>
          </div>
          <RightBar />
        </div>
      </div>
    );
  }

  return (
    <div className="background-page">
      <Header />
      <div className="major-body">
        <Sidebar />
        <div className="main-body">
          <div className="search-results-container">
            <div className="search-header">
              <h1>Search Results for "{query}"</h1>
              <p className="result-count">
                {loading ? "Loading..." : `${totalResults} results found`}
              </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filter Bar */}
            <div className="filter-bar">
              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="sort-select">Sort By</label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="filter-select"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="newest">Newest</option>
                    <option value="mostUpvoted">Most Upvoted</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="status-select">Status</label>
                  <select
                    id="status-select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="filter-select"
                  >
                    <option value="all">All</option>
                    <option value="answered">Answered</option>
                    <option value="unanswered">Unanswered</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="date-select">Date Range</label>
                  <select
                    id="date-select"
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="filter-select"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Last 24 Hours</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {(statusFilter !== "all" ||
                  dateRange !== "all" ||
                  sortBy !== "relevance") && (
                  <button className="reset-btn" onClick={handleResetFilters}>
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="search-results">
              {loading && <div className="loading">Loading results...</div>}

              {!loading && results.length === 0 && !error && (
                <div className="no-results">
                  No results found for "{query}". Try a different keyword or
                  browse tags.
                </div>
              )}

              {!loading &&
                results.length > 0 &&
                results.map((question) => (
                  <div
                    key={question.id}
                    className="result-item"
                    onClick={() => navigate(`/questions/${question.id}`)}
                  >
                    <div className="result-content">
                      <h2 className="result-title">{question.title}</h2>
                      <p className="result-excerpt">
                        {question.body?.substring(0, 150) ||
                          "No description available"}
                        ...
                      </p>
                      <div className="result-tags">
                        {question.tags?.map((tag) => (
                          <span key={tag.id} className="tag">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="result-stats">
                      <div className="stat">
                        <span className="stat-label">Votes</span>
                        <span className="stat-value">
                          {question.voteCount || 0}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Answers</span>
                        <span className="stat-value">
                          {question.answerCount || 0}
                        </span>
                        <span className="answer-count-detail">
                          {question.answerCount === 1
                            ? "1 answer"
                            : `${question.answerCount || 0} answers`}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Views</span>
                        <span className="stat-value">
                          {question.view_count || 0}
                        </span>
                      </div>
                      <div className="stat date">
                        <span className="stat-label">Posted</span>
                        <span className="stat-value">
                          {getDatePosted(question.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    ← Previous
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={`page-number ${
                            page === currentPage ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
          <RightBar />
        </div>
      </div>
    </div>
  );
}
