// src/components/Question/QuestionDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./BasicQuestionDetail.css";

const BasicQuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/questions/${id}`
        );
        const data = await response.json();
        console.log("Question data:", data);
        setQuestion(data.question);

        // Fetch user data for question author and answer authors
        await fetchUserData(data.question);
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async (questionData) => {
      const userIds = new Set();

      // Add question author
      if (questionData.user_id) {
        userIds.add(questionData.user_id);
      }

      // Add answer authors
      if (questionData.answers) {
        questionData.answers.forEach((answer) => {
          if (answer.user_id) {
            userIds.add(answer.user_id);
          }
        });
      }

      // Fetch user data for all unique user IDs
      const userPromises = Array.from(userIds).map((userId) =>
        fetch(`http://localhost:5001/api/users/${userId}`)
          .then((response) => response.json())
          .then((userData) => ({ userId, userData }))
          .catch((error) => {
            console.error(`Error fetching user ${userId}:`, error);
            return {
              userId,
              userData: {
                user: {
                  username: `User ${userId}`,
                  reputation: 0,
                  is_professor: false,
                  is_ta: false,
                },
              },
            };
          })
      );

      const userResults = await Promise.all(userPromises);
      const usersMap = {};
      userResults.forEach(({ userId, userData }) => {
        usersMap[userId] = userData?.user || {
          username: `User ${userId}`,
          reputation: 0,
          is_professor: false,
          is_ta: false,
        };
      });

      setUsers(usersMap);
    };

    fetchQuestion();
  }, [id]);

  const getUserInfo = (userId) => {
    return (
      users[userId] || {
        username: `User ${userId}`,
        reputation: 0,
        is_professor: false,
        is_ta: false,
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(index);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const extractCodeFromHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const preElements = doc.querySelectorAll("pre");
    return Array.from(preElements).map((pre) => pre.textContent);
  };

  const handleVote = async (type, targetId, direction) => {
    console.log(`Vote ${direction} on ${type} ${targetId}`);
    // Add your vote logic here
  };

  const handleBookmark = () => {
    console.log("Bookmark question", question.id);
    // Add bookmark logic here
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="question-detail-loading">
        <div className="spinner"></div>
        <p>Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="question-detail-not-found">
        <h2>Question not found</h2>
        <p>
          The question you're looking for doesn't exist or may have been
          removed.
        </p>
      </div>
    );
  }

  const questionAuthor = getUserInfo(question.user_id);
  const codeBlocks = extractCodeFromHTML(question.body);

  return (
    <div className="question-detail-page">
      <div className="question-detail-layout">
        {/* Main Content Container */}
        <div className="question-main-container">
          <div className="question-content-card">
            {/* Question Header Section */}
            <div className="question-header-section">
              <div className="question-vote-container">
                <button
                  className="vote-button vote-button--up"
                  onClick={() => handleVote("question", question.id, "up")}
                >
                  ▲
                </button>
                <span className="vote-count">{question.voteCount || 0}</span>
                <button
                  className="vote-button vote-button--down"
                  onClick={() => handleVote("question", question.id, "down")}
                >
                  ▼
                </button>
              </div>

              <div className="question-header-content">
                <div className="question-title-container">
                  <h1 className="question-title">{question.title}</h1>
                </div>

                <div className="question-meta-container">
                  <div className="meta-info">
                    <span>Asked {formatDate(question.created_at)}</span>
                    <span className="meta-divider">•</span>
                    <span>Viewed {question.view_count || 0} times</span>
                    <span className="meta-divider">•</span>
                    <span
                      className={`status-badge status-badge--${question.status}`}
                    >
                      {question.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="question-tags-container">
                  <div className="tags-list">
                    {question.tags &&
                      question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="tag-badge tag-badge--clickable"
                        >
                          {tag.tag_name}
                        </span>
                      ))}
                    {question.courseCode && (
                      <span className="course-badge">
                        {question.courseCode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="status-indicators-container">
                  {question.isAnswered && (
                    <span className="status-badge status-badge--answered">
                      ✓ Answered
                    </span>
                  )}
                  {question.hasAcceptedAnswer && (
                    <span className="status-badge status-badge--accepted">
                      ✓ Accepted
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Question Body Section */}
            <div className="question-body-section">
              <div className="question-content-container">
                <div
                  className="question-description"
                  dangerouslySetInnerHTML={{ __html: question.body }}
                />

                {/* Code Blocks Container */}
                <div className="code-blocks-container">
                  {codeBlocks.map((code, index) => (
                    <div key={index} className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-language">Code</span>
                        <button
                          className="code-copy-button"
                          onClick={() => handleCopyCode(code, index)}
                        >
                          {copiedCodeId === index ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre className="code-content">{code}</pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Actions Section */}
            <div className="question-actions-section">
              <div className="actions-container">
                <div className="actions-stats">
                  <span className="action-stat">
                    {question.answerCount || 0} answers
                  </span>
                  <span className="action-stat">
                    {question.commentCount || 0} comments
                  </span>
                </div>

                <div className="actions-buttons">
                  <button className="action-button" onClick={handleBookmark}>
                    {question.isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                  </button>
                  <button className="action-button" onClick={handleShare}>
                    Share
                  </button>
                  {question.user_id === "current_user_id" && (
                    <div className="owner-actions">
                      <button className="action-button action-button--edit">
                        Edit
                      </button>
                      <button className="action-button action-button--danger">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answers Section */}
            <div className="answers-section">
              <div className="answers-header-container">
                <h2 className="answers-title">
                  {question.answers ? question.answers.length : 0} Answer
                  {question.answers?.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="answers-list">
                {question.answers && question.answers.length > 0 ? (
                  question.answers.map((answer, index) => {
                    const answerAuthor = getUserInfo(answer.user_id);
                    const answerCodeBlocks = extractCodeFromHTML(
                      answer.content
                    );

                    return (
                      <div
                        key={index}
                        className={`answer-card ${
                          answer.isAccepted ? "answer-card--accepted" : ""
                        }`}
                      >
                        {answer.isAccepted && (
                          <div className="answer-accepted-badge">
                            ✓ Accepted Answer
                          </div>
                        )}

                        <div className="answer-content-container">
                          <div className="answer-vote-container">
                            <button
                              className="vote-button vote-button--up"
                              onClick={() =>
                                handleVote("answer", answer.id, "up")
                              }
                            >
                              ▲
                            </button>
                            <span className="vote-count">
                              {answer.upvotes || 0}
                            </span>
                            <button
                              className="vote-button vote-button--down"
                              onClick={() =>
                                handleVote("answer", answer.id, "down")
                              }
                            >
                              ▼
                            </button>
                          </div>

                          <div className="answer-body-container">
                            <div
                              className="answer-content"
                              dangerouslySetInnerHTML={{
                                __html: answer.content,
                              }}
                            />

                            {/* Answer Code Blocks */}
                            <div className="answer-code-blocks">
                              {answerCodeBlocks.map((code, codeIndex) => (
                                <div
                                  key={codeIndex}
                                  className="code-block-wrapper"
                                >
                                  <div className="code-block-header">
                                    <span className="code-language">Code</span>
                                    <button
                                      className="code-copy-button"
                                      onClick={() =>
                                        handleCopyCode(
                                          code,
                                          `answer-${index}-${codeIndex}`
                                        )
                                      }
                                    >
                                      {copiedCodeId ===
                                      `answer-${index}-${codeIndex}`
                                        ? "Copied!"
                                        : "Copy"}
                                    </button>
                                  </div>
                                  <pre className="code-content">{code}</pre>
                                </div>
                              ))}
                            </div>

                            <div className="answer-footer-container">
                              <div className="answer-meta">
                                <span className="answer-time">
                                  Answered {formatDate(answer.created_at)}
                                </span>
                              </div>
                              <div className="answer-actions">
                                <button className="action-button">Share</button>
                                <button className="action-button">
                                  Report
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-answers-container">
                    <div className="no-answers-content">
                      <p>
                        No answers yet. Be the first to answer this question!
                      </p>
                      <button className="action-button action-button--primary">
                        Answer Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Container */}
        <div className="question-sidebar-container">
          {/* Author Card */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Asked by</h3>
            </div>
            <div className="card-content">
              <div className="author-profile">
                <div className="author-avatar-container">
                  {questionAuthor.avatar ? (
                    <img
                      src={questionAuthor.avatar}
                      alt={questionAuthor.username}
                      className="author-avatar"
                    />
                  ) : (
                    <div className="author-avatar-placeholder">
                      {questionAuthor.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="author-details-container">
                  <div className="author-name-container">
                    <a
                      href={`/users/${question.user_id}`}
                      className="author-name"
                    >
                      {questionAuthor.username}
                    </a>
                    <div className="verification-badges">
                      {questionAuthor.is_professor && (
                        <span className="verification-badge verification-badge--professor">
                          Professor
                        </span>
                      )}
                      {questionAuthor.is_ta && (
                        <span className="verification-badge verification-badge--ta">
                          TA
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="author-reputation-container">
                    <span className="reputation-icon">⭐</span>
                    <span className="reputation-value">
                      {questionAuthor.reputation || 0} reputation
                    </span>
                  </div>
                  <div className="author-join-date">
                    Member since{" "}
                    {questionAuthor.join_date
                      ? formatDate(questionAuthor.join_date)
                      : "recently"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Question Stats</h3>
            </div>
            <div className="card-content">
              <div className="stats-container">
                <div className="stat-row">
                  <span className="stat-label">Views:</span>
                  <span className="stat-value">{question.view_count || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Answers:</span>
                  <span className="stat-value">
                    {question.answers?.length || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Votes:</span>
                  <span className="stat-value">{question.voteCount || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Asked:</span>
                  <span className="stat-value">
                    {formatDate(question.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Questions Card */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Related Questions</h3>
            </div>
            <div className="card-content">
              <div className="related-questions-container">
                <p className="no-related">No related questions found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicQuestionDetail;
