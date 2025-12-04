import React, { useState, useEffect } from "react";
import apiFetch from "../utils/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import RightBar from "../components/RightBar";
import API_BASE_URL from "../constants/apiConfig";
import "../styles/SearchResults.css";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
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

  // Helper function to calculate search score (same as backend fuzzy search)
  const calculateScore = (query, title, body = "") => {
    if (!query || !title) return 0.0;

    const cleanQuery = query
      .replace(/[^\w\s]/g, "")
      .toLowerCase()
      .trim();
    const cleanTitle = title
      .replace(/[^\w\s]/g, "")
      .toLowerCase()
      .trim();

    // Exact title match gets highest score
    if (cleanQuery === cleanTitle) return 1.0;

    const queryWords = new Set(cleanQuery.split(" "));
    let titleWords = new Set(cleanTitle.split(" "));

    // Remove stop words
    const stopWords = new Set([
      "the",
      "is",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "what",
      "how",
      "when",
      "where",
      "why",
    ]);
    const cleanedQueryWords = new Set(
      [...queryWords].filter((w) => !stopWords.has(w))
    );
    titleWords = new Set([...titleWords].filter((w) => !stopWords.has(w)));

    // Calculate word overlap
    const overlap = [...cleanedQueryWords].filter((w) =>
      titleWords.has(w)
    ).length;
    const totalQueryWords = cleanedQueryWords.size;

    if (totalQueryWords === 0) return 0.0;

    const score = (overlap / totalQueryWords) * 0.9;
    return Math.min(score, 1.0);
  };

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
        // Fetch all questions (same as QuestionTile - no view count increment)
        const response = await apiFetch(`${API_BASE_URL}/questions`);

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        const allQuestions = data.questions || [];

        // Filter by search query client-side
        const searchResults = allQuestions
          .map((question) => ({
            ...question,
            score: calculateScore(query, question.title, question.body),
          }))
          .filter((q) => q.score > 0.5)
          .sort((a, b) => b.score - a.score);

        setResults(searchResults);
        setTotalResults(searchResults.length);
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

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...results];

    // Filter by status (answered/unanswered)
    if (statusFilter === "answered") {
      filtered = filtered.filter((q) => (q.answerCount || 0) > 0);
    } else if (statusFilter === "unanswered") {
      filtered = filtered.filter((q) => (q.answerCount || 0) === 0);
    }

    // Filter by date range
    const now = new Date();
    if (dateRange !== "all") {
      filtered = filtered.filter((q) => {
        const createdDate = new Date(q.created_at);
        const diffTime = now - createdDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        switch (dateRange) {
          case "today":
            return diffDays <= 1;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Sort results
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "mostAnswered":
        filtered.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
        break;
      case "mostVoted":
        filtered.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        break;
      case "relevance":
      default:
        filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
    }

    // setEnrichedResults(filtered);
    setFilteredResults(filtered);
    setTotalResults(filtered.length);
    setCurrentPage(1);
  }, [results, statusFilter, dateRange, sortBy]);

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
                    <option value="mostVoted">Most Voted</option>
                    <option value="mostAnswered">Most Answered</option>
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

              {!loading && filteredResults.length === 0 && !error && (
                <div className="no-results">
                  No results found for "{query}". Try a different keyword or
                  browse tags.
                </div>
              )}

              {!loading &&
                filteredResults.length > 0 &&
                filteredResults.map((question) => (
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
                      {/* <div className="result-tags">
                        {question.tags?.map((tag) => (
                          <span key={tag.id} className="tag">
                            {tag.name}
                          </span>
                        ))}
                      </div> */}
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
                        {/* <span className="answer-count-detail">
                          {question.answerCount === 1
                            ? "1 answer"
                            : `${question.answerCount || 0} answers`}
                        </span> */}
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
