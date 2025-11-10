import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./QuestionDetailPage.css";

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  // Mock current user - replace with actual auth context
  const currentUser = {
    id: "user123",
    username: "Current User",
    email: "user@dal.ca",
    reputation: 1500,
    isProfessor: false,
    isTA: true,
  };

  useEffect(() => {
    loadQuestionData();
  }, [id]);

  const loadQuestionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5001/api/questions/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch question: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend data:", data);

      // Transform backend data to match our component structure
      const transformedQuestion = transformQuestionData(data.question);
      const transformedAnswers = transformAnswersData(data.answers || []);

      setQuestion(transformedQuestion);
      setAnswers(transformedAnswers);
    } catch (error) {
      console.error("Error fetching question:", error);
      setError("Failed to load question. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Transform backend question data
  const transformQuestionData = (backendQuestion) => {
    if (!backendQuestion) return null;

    return {
      id: backendQuestion.id,
      title: backendQuestion.title,
      description: backendQuestion.body,
      body: backendQuestion.body,
      author: {
        id: backendQuestion.user_id,
        username: `User ${backendQuestion.user_id}`,
        reputation: 1500,
        isProfessor: false,
        isTA: false,
      },
      tags: backendQuestion.tags
        ? backendQuestion.tags.map((tag) => ({
            id: tag.id,
            name: tag.tag_name,
            description: tag.tag_description || "",
          }))
        : [],
      voteCount: 0,
      viewCount: backendQuestion.view_count || 0,
      commentCount: 0,
      answerCount: backendQuestion.answers ? backendQuestion.answers.length : 0,
      isAnswered: backendQuestion.answers && backendQuestion.answers.length > 0,
      hasAcceptedAnswer: false,
      isBookmarked: false,
      isAnonymous: false,
      courseCode: "CSCI 3130",
      createdAt: backendQuestion.created_at,
      updatedAt: backendQuestion.updated_at,
      status: backendQuestion.status,
      type: backendQuestion.type,
    };
  };

  // Transform backend answers data
  const transformAnswersData = (backendAnswers) => {
    return backendAnswers.map((answer) => ({
      id: answer.id,
      questionId: answer.question_id,
      body: answer.content,
      author: {
        id: answer.user_id,
        name: `User ${answer.user_id}`,
        username: `User ${answer.user_id}`,
      },
      voteCount: answer.upvotes || 0,
      isAccepted: answer.is_accepted || false,
      createdAt: answer.created_at,
    }));
  };

  // Vote handler
  const handleVote = async (type, targetId, direction) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/${type}s/${targetId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            direction,
            userId: currentUser.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Vote failed: ${response.status}`);
      }

      await loadQuestionData();
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to submit vote. Please try again.");
    }
  };

  // Bookmark handler
  const handleBookmark = async (questionId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/questions/${questionId}/bookmark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Bookmark failed: ${response.status}`);
      }

      const result = await response.json();
      setQuestion((prev) =>
        prev ? { ...prev, isBookmarked: result.isBookmarked } : null
      );
    } catch (error) {
      console.error("Error bookmarking:", error);
      alert("Failed to update bookmark. Please try again.");
    }
  };

  // Submit answer handler
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!newAnswer.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/questions/${id}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newAnswer,
            userId: currentUser.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Answer submission failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Answer submitted:", result);

      // Reset form and reload data
      setNewAnswer("");
      setShowAnswerForm(false);
      await loadQuestionData();

      alert("Answer submitted successfully!");
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    }
  };

  // Edit handler
  const handleEdit = (questionId) => {
    navigate(`/questions/${questionId}/edit`);
  };

  // Delete handler
  const handleDelete = async (questionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: currentUser.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      alert("Question deleted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question. Please try again.");
    }
  };

  // Share handler
  const handleShare = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: question?.title,
          url: url,
        })
        .catch(() => {
          copyToClipboard(url);
        });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Link copied to clipboard!");
      });
  };

  // Report handler
  const handleReport = async (type, targetId) => {
    const reason = prompt(
      `Please enter the reason for reporting this ${type}:`
    );
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:5001/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          targetId,
          reason,
          userId: currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Report failed: ${response.status}`);
      }

      alert("Thank you for reporting. Our team will review this content.");
    } catch (error) {
      console.error("Error reporting:", error);
      alert("Failed to submit report. Please try again.");
    }
  };

  // Tag click handler
  const handleTagClick = (tagName) => {
    navigate(`/tags/${tagName}`);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="question-detail-loading">
        <div className="spinner"></div>
        <p>Loading question...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="question-detail-error">
        <h2>Error Loading Question</h2>
        <p>{error}</p>
        <button onClick={loadQuestionData} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  // Question not found
  if (!question) {
    return (
      <div className="question-detail-not-found">
        <h2>Question not found</h2>
        <p>
          The question you're looking for doesn't exist or may have been
          removed.
        </p>
        <button onClick={() => navigate("/")} className="home-btn">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="question-detail-container">
      {/* Question Header */}
      <div className="question-header">
        <div className="question-title-section">
          <h1 className="question-title">{question.title}</h1>
          <div className="question-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowAnswerForm(!showAnswerForm)}
            >
              Answer Question
            </button>
            <button
              className={`btn btn-bookmark ${
                question.isBookmarked ? "bookmarked" : ""
              }`}
              onClick={() => handleBookmark(question.id)}
            >
              {question.isBookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
            <button className="btn btn-secondary" onClick={handleShare}>
              Share
            </button>
          </div>
        </div>

        <div className="question-meta">
          <div className="meta-item">
            <span className="meta-label">Asked</span>
            <span className="meta-value">{formatDate(question.createdAt)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Viewed</span>
            <span className="meta-value">{question.viewCount} times</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className={`status-badge ${question.status}`}>
              {question.status}
            </span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="question-content">
        <div className="vote-section">
          <button
            className="vote-btn upvote"
            onClick={() => handleVote("question", question.id, "up")}
          >
            ▲
          </button>
          <span className="vote-count">{question.voteCount}</span>
          <button
            className="vote-btn downvote"
            onClick={() => handleVote("question", question.id, "down")}
          >
            ▼
          </button>
        </div>

        <div className="content-main">
          <div
            className="question-body"
            dangerouslySetInnerHTML={{ __html: question.body }}
          />

          <div className="question-tags">
            {question.tags.map((tag) => (
              <button
                key={tag.id}
                className="tag"
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
              </button>
            ))}
          </div>

          <div className="question-footer">
            <div className="question-actions-footer">
              {currentUser.id === question.author.id && (
                <>
                  <button
                    className="btn-link"
                    onClick={() => handleEdit(question.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-link delete"
                    onClick={() => handleDelete(question.id)}
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                className="btn-link"
                onClick={() => handleReport("question", question.id)}
              >
                Report
              </button>
            </div>

            <div className="author-info">
              <div className="author-details">
                <span className="asked-by">Asked by</span>
                <span className="author-name">{question.author.username}</span>
                <span className="author-reputation">
                  {question.author.reputation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="answers-section">
        <div className="answers-header">
          <h2>
            {answers.length} Answer{answers.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {answers.map((answer) => (
          <div
            key={answer.id}
            className={`answer-card ${answer.isAccepted ? "accepted" : ""}`}
          >
            <div className="vote-section">
              <button
                className="vote-btn upvote"
                onClick={() => handleVote("answer", answer.id, "up")}
              >
                ▲
              </button>
              <span className="vote-count">{answer.voteCount}</span>
              <button
                className="vote-btn downvote"
                onClick={() => handleVote("answer", answer.id, "down")}
              >
                ▼
              </button>
              {answer.isAccepted && (
                <div className="accepted-badge" title="Accepted Answer">
                  ✓
                </div>
              )}
            </div>

            <div className="answer-content">
              <div
                className="answer-body"
                dangerouslySetInnerHTML={{ __html: answer.body }}
              />

              <div className="answer-footer">
                <div className="answer-actions">
                  <button
                    className="btn-link"
                    onClick={() => handleReport("answer", answer.id)}
                  >
                    Report
                  </button>
                </div>

                <div className="author-info">
                  <div className="author-details">
                    <span className="answered-by">Answered</span>
                    <span className="author-name">
                      {answer.author.username}
                    </span>
                    <span className="answer-date">
                      {formatDate(answer.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {answers.length === 0 && (
          <div className="no-answers">
            <p>No answers yet. Be the first to answer this question!</p>
          </div>
        )}
      </div>

      {/* Answer Form */}
      {showAnswerForm && (
        <div className="answer-form-section">
          <h3>Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              className="answer-textarea"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here... You can use HTML tags for formatting."
              rows={10}
              required
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Post Your Answer
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAnswerForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuestionDetailPage;
