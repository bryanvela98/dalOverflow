import React, { useState, useEffect } from "react";
import apiFetch from "../../utils/api";
import { Link } from "react-router-dom";
import "./QuestionTile.css";
import API_BASE_URL from "../../constants/apiConfig";
import NewQuestionButton from "../NewQuestionButton.jsx";

export default function QuestionTile() {
  const [questions, setQuestions] = useState([]);
  const [sortedQuestions, setSortedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("best");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/questions`);
        const data = await response.json();
        if (data.questions) {
          setQuestions(data.questions);
          // Extract unique tags from all questions
          const tags = new Set();
          data.questions.forEach((q) => {
            if (q.tags && Array.isArray(q.tags)) {
              q.tags.forEach((tag) =>
                tags.add(JSON.stringify({ id: tag.id, name: tag.tag_name }))
              );
            }
          });
          setAvailableTags(Array.from(tags).map((t) => JSON.parse(t)));
        }
      } catch (err) {
        setError("Failed to load questions");
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Sort and filter questions based on selected filter and tags
  useEffect(() => {
    let filtered = [...questions];

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((question) => {
        if (!question.tags) return false;
        return selectedTags.some((selectedTag) =>
          question.tags.some((qTag) => qTag.id === selectedTag.id)
        );
      });
    }

    // Sort questions based on selected filter
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        break;
      case "most-votes":
        filtered.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        break;
      case "most-answered":
        filtered.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
        break;
      case "best":
      default:
        // Best = combination of votes and answers
        filtered.sort((a, b) => {
          const scoreA = (a.voteCount || 0) + (a.answerCount || 0) * 2;
          const scoreB = (b.voteCount || 0) + (b.answerCount || 0) * 2;
          return scoreB - scoreA;
        });
        break;
    }

    setSortedQuestions(filtered);
  }, [questions, sortBy, selectedTags]);

  if (loading)
    return (
      <div className="centre-body">
        <p>Loading questions...</p>
      </div>
    );
  if (error)
    return (
      <div className="centre-body">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="centre-body">
      <div className="filter-question-div">
        <div className="filter">
          <div className="sort-dropdown">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="best">Best</option>
              <option value="newest">Newest</option>
              <option value="most-votes">Most Votes</option>
              <option value="most-answered">Most Answered</option>
            </select>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowFilterMenu(!showFilterMenu)}>
              <p>Filter</p>
              <img src="/Filter.png" alt="" className="logo" />
            </button>
            {showFilterMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 10,
                  minWidth: "300px",
                  padding: "15px",
                  marginTop: "5px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Filter by Tags
                </h4>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {availableTags.length > 0 ? (
                    availableTags.map((tag) => (
                      <label
                        key={tag.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "8px 0",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.some((t) => t.id === tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag]);
                            } else {
                              setSelectedTags(
                                selectedTags.filter((t) => t.id !== tag.id)
                              );
                            }
                          }}
                          style={{ marginRight: "8px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: "13px", color: "#333" }}>
                          {tag.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <p style={{ fontSize: "12px", color: "#999" }}>
                      No tags available
                    </p>
                  )}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding: "8px",
                      background: "#f0f0f0",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="new-question">
          <NewQuestionButton />
        </div>
      </div>
      <div className="tiles">
        {sortedQuestions.length > 0 ? (
          sortedQuestions.map((question) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="tile">
                <div className="tile-centre">
                  <div className="question">{question.title}</div>
                  <hr />
                  <div className="answer">
                    {(question.body?.replace(/<[^>]*>/g, "").substring(0, 200) ||
                      "No description available")}
                    ...
                  </div>
                </div>
                <div className="tile-right">
                  <div className="votes">
                    <button className="upvote">
                      <img src="Upvote1.jpeg" alt="" className="logo" />
                    </button>
                    <p className="counter">{question.voteCount || 0}</p>
                    <button className="downvote">
                      <img src="/Downvote1.jpeg" alt="" className="logo" />
                    </button>
                  </div>
                  <div className="comments">
                    <img src="/MessageSquare.png" alt="" className="logo" />
                    <p className="comment-counter">
                      {question.answerCount || 0}
                    </p>
                  </div>
                  <div className="views">
                    <p>Views</p>
                    <p className="views-counter">{question.view_count || 0}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No questions available</p>
        )}
      </div>
    </div>
  );
}
