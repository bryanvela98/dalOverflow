import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./QuestionEditHistory.css";
import BackButton from "../BackButton";

/**
 * Question Edit History Component (AC 8)
 * Displays the edit history of a question
 */
const QuestionEditHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        // Fetch question details
        const questionResponse = await fetch(
          `http://localhost:5001/api/questions/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
          }
        );

        if (!questionResponse.ok) {
          throw new Error("Failed to load question");
        }

        const questionData = await questionResponse.json();
        setQuestion(questionData.question);

        // Fetch edit history
        const historyResponse = await fetch(
          `http://localhost:5001/api/questions/${id}/history`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            credentials: "include",
          }
        );

        if (!historyResponse.ok) {
          throw new Error("Failed to load edit history");
        }

        const historyData = await historyResponse.json();
        setHistory(historyData.history || []);
      } catch (err) {
        console.error("Error loading edit history:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading edit history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-message">
          <h2>Error Loading History</h2>
          <p>{error}</p>
          <button onClick={() => navigate(`/questions/${id}`)}>
            Back to Question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <BackButton />
        <h1>Edit History</h1>
        {question && (
          <div className="question-info">
            <h2>{question.title}</h2>
            <p>
              Total edits: <strong>{question.edit_count || 0}</strong>
            </p>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="no-history">
          <p>This question has not been edited yet.</p>
        </div>
      ) : (
        <div className="history-timeline">
          {history.map((edit, index) => (
            <div key={edit.id} className="history-item">
              <div className="history-item-header">
                <div className="history-item-meta">
                  <span className="edit-number">
                    Edit #{history.length - index}
                  </span>
                  <span className="edit-date">{formatDate(edit.created_at)}</span>
                  {edit.is_moderator_edit && (
                    <span className="moderator-badge">Moderator Edit</span>
                  )}
                  {edit.requires_review && (
                    <span className="review-badge">Requires Review</span>
                  )}
                </div>
              </div>

              <div className="history-item-content">
                {/* Title Change */}
                {edit.title_changed && (
                  <div className="change-block">
                    <h4>Title Changed</h4>
                    <div className="change-diff">
                      <div className="diff-old">
                        <span className="diff-label">Previous:</span>
                        <p>{edit.previous_title}</p>
                      </div>
                      <div className="diff-new">
                        <span className="diff-label">New:</span>
                        <p>{edit.new_title}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Body Change */}
                {edit.body_changed && (
                  <div className="change-block">
                    <h4>Body Changed</h4>
                    <p className="change-note">
                      The question body was modified in this edit.
                    </p>
                  </div>
                )}

                {/* Tags Change */}
                {edit.tags_changed && (
                  <div className="change-block">
                    <h4>Tags Changed</h4>
                    <div className="tags-diff">
                      <div className="diff-old">
                        <span className="diff-label">Previous tags:</span>
                        <div className="tag-list">
                          {edit.previous_tag_ids?.map((tagId) => (
                            <span key={tagId} className="tag-badge">
                              Tag {tagId}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="diff-new">
                        <span className="diff-label">New tags:</span>
                        <div className="tag-list">
                          {edit.new_tag_ids?.map((tagId) => (
                            <span key={tagId} className="tag-badge">
                              Tag {tagId}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Reason */}
                {edit.edit_reason && (
                  <div className="edit-reason">
                    <h4>Edit Reason</h4>
                    <p>{edit.edit_reason}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Original Post */}
          <div className="history-item history-item-original">
            <div className="history-item-header">
              <div className="history-item-meta">
                <span className="edit-number">Original Post</span>
                <span className="edit-date">
                  {formatDate(question?.created_at)}
                </span>
              </div>
            </div>
            <div className="history-item-content">
              <p>Question was originally posted.</p>
            </div>
          </div>
        </div>
      )}

      <div className="history-actions">
        <button
          className="btn btn--secondary"
          onClick={() => navigate(`/questions/${id}`)}
        >
          Back to Question
        </button>
      </div>
    </div>
  );
};

export default QuestionEditHistory;