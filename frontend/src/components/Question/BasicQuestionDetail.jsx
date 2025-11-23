// src/components/Question/QuestionDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./BasicQuestionDetail.css";

const BasicQuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [ansContent, setAnsContent] = useState("");
  const [isSubmitAns, setIsSubmitAns] = useState(false);
  const [ansErr, setAnsErr] = useState("");
  const ansForm = React.useRef(null);
  const ansList = React.useRef(null);

  // Mock answers data
  const mockAnswers = [
    {
      id: 1,
      user_id: 2,
      content: `<p>This is a great question! Here's a solution that should work for your case:</p>
                <p>First, make sure you have the correct dependencies installed:</p>
                <pre>npm install react-router-dom</pre>
                <p>Then, you can structure your routes like this:</p>
                <pre>import { BrowserRouter, Routes, Route } from 'react-router-dom';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path="/" element={<Home />} />\n        <Route path="/questions/:id" element={<QuestionDetail />} />\n      </Routes>\n    </BrowserRouter>\n  );\n}</pre>`,
      created_at: "2024-01-15T14:30:00Z",
      upvotes: 8,
      isAccepted: true,
    },
    {
      id: 2,
      user_id: 3,
      content: `<p>Another approach you might consider is using React Query for data fetching:</p>
                <p>Install React Query:</p>
                <pre>npm install @tanstack/react-query</pre>
                <p>Then use it in your component:</p>
                <pre>import { useQuery } from '@tanstack/react-query';\n\nconst fetchQuestion = async (id) => {\n  const response = await fetch(\`/api/questions/\${id}\`);\n  return response.json();\n};\n\nfunction QuestionDetail() {\n  const { id } = useParams();\n  const { data, isLoading } = useQuery(['question', id], () => fetchQuestion(id));\n  \n  if (isLoading) return <div>Loading...</div>;\n  \n  return <div>{/* render question */}</div>;\n}</pre>`,
      created_at: "2024-01-15T16:45:00Z",
      upvotes: 5,
      isAccepted: false,
    },
    {
      id: 3,
      user_id: 4,
      content: `<p>Don't forget to handle error states as well! Here's a complete example with error handling:</p>
                <pre>const { data, isLoading, error } = useQuery(['question', id], () => fetchQuestion(id));\n\nif (isLoading) return <div>Loading question...</div>;\nif (error) return <div>Error loading question: {error.message}</div>;</pre>
                <p>This will make your app more robust and user-friendly.</p>`,
      created_at: "2024-01-16T09:15:00Z",
      upvotes: 3,
      isAccepted: false,
    },
  ];

  // Mock users data for answer authors only
  const mockAnswerUsers = {
    2: {
      username: "ReactExpert",
      reputation: 2450,
      is_professor: false,
      is_ta: true,
      avatar: null,
      join_date: "2023-05-15T00:00:00Z",
    },
    3: {
      username: "CodeMaster",
      reputation: 1800,
      is_professor: true,
      is_ta: false,
      avatar: null,
      join_date: "2022-11-20T00:00:00Z",
    },
    4: {
      username: "DevHelper",
      reputation: 920,
      is_professor: false,
      is_ta: false,
      avatar: null,
      join_date: "2024-01-01T00:00:00Z",
    },
  };

  useEffect(() => {
    let isMounted = true;

    const fetchQuestion = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/questions/${id}`
        );
        const data = await response.json();
        console.log("Question data:", data);

        if (isMounted) {
          // Enhance the question data with mock answers
          if (!data.question) {
            setLoading(false);
            return; // Stop execution if no question found
          }

          const enhancedQuestion = {
            ...data.question,
            answers: mockAnswers, // Always use mock answers
            answerCount: mockAnswers.length,
            isAnswered: true,
            hasAcceptedAnswer: true,
          };

          setQuestion(enhancedQuestion);

          // Fetch real user data for question author from backend
          await fetchUserData(data.question);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchUserData = async (questionData) => {
      if (!isMounted) return;

      const usersMap = { ...mockAnswerUsers }; // Start with mock answer users

      // Try to get user from localStorage first (login data)
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (currentUser && questionData.user_id) {
          usersMap[questionData.user_id] = {
            username: currentUser.username || `User ${questionData.user_id}`,
            reputation: currentUser.reputation || 0,
            is_professor: currentUser.is_professor || false,
            is_ta: currentUser.is_ta || false,
            avatar: currentUser.avatar,
            join_date: currentUser.join_date,
          };
        }
      } catch (error) {
        console.error("Error getting user from localStorage:", error);
      }

      const user_id = questionData.user_id;
      if (user_id && !usersMap[user_id]) {
        try {
          const response = await fetch(
            `http://localhost:5001/api/users/${user_id}`
          );
          if (response.ok) {
            const userData = await response.json();
            usersMap[user_id] = userData?.user || {
              username: `User ${user_id}`,
              reputation: 0,
              is_professor: false,
              is_ta: false,
            };
          } else {
            throw new Error("API returned error");
          }
        } catch (error) {
          console.error(`Error fetching user ${user_id}:`, error);
          // Final fallback
          usersMap[user_id] = {
            username: `User ${user_id}`,
            reputation: 0,
            is_professor: false,
            is_ta: false,
          };
        }
      }

      if (isMounted) {
        setUsers(usersMap);
      }
    };

    fetchQuestion();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const getAnsInpLen = (html) => {
    if (!html) return 0;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || "").trim().length;
  };

  //validate if 20 chars are inputted
  const isAnsLengVal = () => {
    const ansLength = getAnsInpLen(ansContent);
    return ansLength >= 20 && !isSubmitAns;
  };

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

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!isAnsLengVal()) {
      setAnsErr("Answer must be at least 20 characters long.");
      return;
    }

    setIsSubmitAns(true);
    setAnsErr("");

    try {
      const response = await fetch(
        `http://localhost:5001/api/questions/${id}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: ansContent }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to post answer");
      }

      const data = await response.json();
      const ansNew = data.answer || data || {
        id: Date.now().toString(),
        content: ansContent,
        user_id: question?.user_id || "unknown",
        upvotes: 0,
        created_at: new Date().toISOString(),
        is_accepted: false,
      };

      setQuestion((prev) => {
        const updateAns = [...(prev?.answers || []), ansNew];
        return {
          ...prev,
          answers: updateAns,
          ansCount: updateAns.length,
          isAnswered: updateAns.length > 0,
        };
      });

      setAnsContent("");

      //scroll down to the answer
      setTimeout(() => {
        const ansCard = ansList.current?.querySelectorAll?.(".answer-card") ||
          document.querySelectorAll(".answer-card");
        const latestAns = ansCard[ansCard.length - 1];
        if (latestAns) {
          latestAns.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);

    } catch (error) {
      console.error("Error posting answer:", error);
      setAnsErr(error.message || "Failed to post answer. Please try again.");
    } finally {
      setIsSubmitAns(false);
    }
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
                        <span className="code-language">JavaScript</span>
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
                  <div className="no-answers-container">
                    <div className="no-answers-content">
                      <button className="action-button action-button--primary">
                        Answer Question
                      </button>
                    </div>
                  </div>
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
                                    <span className="code-language">
                                      JavaScript
                                    </span>
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
                                <div className="answer-author">
                                  <span className="answer-author-name">
                                    Answered by {answerAuthor.username}
                                  </span>
                                  {answerAuthor.is_professor && (
                                    <span className="verification-badge verification-badge--professor">
                                      Professor
                                    </span>
                                  )}
                                  {answerAuthor.is_ta && (
                                    <span className="verification-badge verification-badge--ta">
                                      TA
                                    </span>
                                  )}
                                </div>
                                <span className="answer-time">
                                  {formatDate(answer.created_at)}
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
                    </div>
                  </div>
                )}
              </div>

              <form className="user-ans-input" ref={ansForm} onSubmit={handleSubmitAnswer}>
                <h3 className="ans-inp-title">Add your answer</h3>

                {ansErr && (
                  <div className="ans-inp-err">{ansErr}</div>
                )}

                <div className="ans-inp-content">
                  <ReactQuill
                    value={ansContent}
                    onChange={(content) => {
                      setAnsContent(content);
                      if (ansErr) setAnsErr("");
                    }}
                    placeholder="Answer here pls![atleast 20 characters]"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "code-block"],
                        ["clean"],
                      ],
                    }}
                    className="ans-edit"
                  />
                </div>

                <div className="ans-inp-actions">
                  <button
                    type="submit"
                    className="action-button action-button--primary"
                    disabled={!isAnsLengVal()}
                  >
                    {isSubmitAns ? "Posting..." : "Post Answer"}
                  </button>
                </div>
              </form>

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
                <div className="related-question">
                  <a href="/questions/2" className="related-question-link">
                    How to handle nested routes in React Router?
                  </a>
                  <div className="related-question-meta">
                    <span>12 answers</span>
                  </div>
                </div>
                <div className="related-question">
                  <a href="/questions/3" className="related-question-link">
                    React Router v6 migration guide
                  </a>
                  <div className="related-question-meta">
                    <span>8 answers</span>
                  </div>
                </div>
                <div className="related-question">
                  <a href="/questions/4" className="related-question-link">
                    Protected routes with authentication in React
                  </a>
                  <div className="related-question-meta">
                    <span>15 answers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicQuestionDetail;
