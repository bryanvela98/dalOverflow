import React, { useState, useEffect } from "react";
import apiFetch from "../utils/api";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import RightBar from "../components/RightBar";
import API_BASE_URL from "../constants/apiConfig";
import "../styles/TagDetail.css";

export default function TagDetail() {
  const { tagId } = useParams();
  const [tag, setTag] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTagAndQuestions = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/tags/${tagId}/questions`);
        const data = await response.json();
        if (data.tag) {
          setTag(data.tag);
          setQuestions(data.questions || []);
        } else {
          setError("Tag not found");
        }
      } catch (err) {
        setError("Failed to load tag details");
        console.error("Error fetching tag:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTagAndQuestions();
  }, [tagId]);

  return (
    <div className="background-page">
      <Header />
      <div className="major-body">
        <Sidebar />
        <div className="main-body">
          <div className="tag-detail-container">
            {loading && <p className="loading-message">Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && tag && (
              <>
                <div className="tag-detail-header">
                  <div className="tag-info">
                    <h1 className="tag-title">{tag.tag_name}</h1>
                    <p className="tag-description">
                      {tag.description || "No description available"}
                    </p>
                  </div>
                  <div className="tag-stats">
                    <div className="stat">
                      <span className="stat-value">{questions.length}</span>
                      <span className="stat-label">Questions</span>
                    </div>
                  </div>
                </div>

                <div className="tag-questions">
                  <h2>Questions tagged with "{tag.tag_name}"</h2>
                  {questions.length > 0 ? (
                    <div className="questions-list">
                      {questions.map((question) => (
                        <Link
                          key={question.id}
                          to={`/questions/${question.id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div className="question-item">
                            <div className="question-content">
                              <h3 className="question-title">
                                {question.title}
                              </h3>
                              <p className="question-preview">
                                {question.body?.substring(0, 150) ||
                                  "No description available"}
                                ...
                              </p>
                              <div className="question-tags">
                                {question.tags &&
                                  question.tags.map((t) => (
                                    <span key={t.id} className="tag-badge">
                                      {t.tag_name}
                                    </span>
                                  ))}
                              </div>
                            </div>
                            <div className="question-stats">
                              <div className="stat">
                                <span className="stat-value">
                                  {question.view_count || 0}
                                </span>
                                <span className="stat-label">Views</span>
                              </div>
                              <div className="stat">
                                <span className="stat-value">
                                  {question.answerCount || 0}
                                </span>
                                <span className="stat-label">Answers</span>
                              </div>
                              <div className="stat">
                                <span className="stat-value">
                                  {question.voteCount || 0}
                                </span>
                                <span className="stat-label">Votes</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="no-questions">
                      No questions found with this tag
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <RightBar />
        </div>
      </div>
    </div>
  );
}
