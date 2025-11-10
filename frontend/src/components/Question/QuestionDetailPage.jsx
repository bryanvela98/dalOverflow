import React, { useState, useEffect } from "react";
import "./QuestionDetailPage.css";

/**
 * Question Detail Page Component (Issue #5)
 * Pure JavaScript version
 */
const QuestionDetailPage = ({
  question,
  answers,
  comments,
  currentUser,
  onVote,
  onBookmark,
  onEdit,
  onDelete,
  onShare,
  onReport,
  onTagClick,
}) => {
  const [copiedCodeBlock, setCopiedCodeBlock] = useState(null);

  const formatTimeAgo = (date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // AC 3: Add copy button to code blocks
  useEffect(() => {
    const codeBlocks = document.querySelectorAll("pre");
    codeBlocks.forEach((block, index) => {
      if (!block.querySelector(".code-copy-button")) {
        const wrapper = document.createElement("div");
        wrapper.className = "code-block-wrapper";
        block.parentNode?.insertBefore(wrapper, block);
        wrapper.appendChild(block);

        const button = document.createElement("button");
        button.className = "code-copy-button";
        button.textContent = copiedCodeBlock === index ? "Copied!" : "Copy";
        button.onclick = () => handleCopyCode(block.textContent || "", index);
        wrapper.appendChild(button);
      }
    });
  }, [question.description, copiedCodeBlock]);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeBlock(index);
    setTimeout(() => setCopiedCodeBlock(null), 2000);
  };

  const isAuthor = currentUser && currentUser.id === question.authorId;

  // AC 6: Handle anonymous display
  const displayAuthor = question.isAnonymous
    ? {
        username: "Anonymous Dalhousie Student",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous`,
        reputation: 0,
        isProfessor: false,
        isTA: false,
      }
    : question.author;

  return (
    <div className="question-detail-page">
      <div className="question-detail-container">
        {/* AC 1: Question Header */}
        <header className="question-header">
          <div className="question-header-main">
            <div className="vote-section">
              <button
                className="vote-button vote-button--up"
                onClick={() => onVote("question", question.id, "up")}
                aria-label="Upvote"
              >
                ▲
              </button>
              <span className="vote-count">{question.voteCount}</span>
              <button
                className="vote-button vote-button--down"
                onClick={() => onVote("question", question.id, "down")}
                aria-label="Downvote"
              >
                ▼
              </button>
            </div>

            <div className="question-header-content">
              <h1 className="question-title">{question.title}</h1>

              <div className="question-meta">
                <span className="meta-item">
                  Asked {formatTimeAgo(question.createdAt)}
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-item">
                  Viewed {question.viewCount.toLocaleString()} times
                </span>
                {question.updatedAt !== question.createdAt && (
                  <>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      Modified {formatTimeAgo(question.updatedAt)}
                    </span>
                  </>
                )}
              </div>

              {/* AC 5: Course Tags */}
              <div className="question-tags">
                {question.tags.map((tag) => (
                  <button
                    key={tag.id}
                    className="tag-badge tag-badge--clickable"
                    onClick={() => onTagClick(tag.id)}
                    title={tag.description}
                  >
                    {tag.name}
                  </button>
                ))}
                {question.courseCode && (
                  <span
                    className="course-badge"
                    title={`Course: ${question.courseCode}`}
                  >
                    {question.courseCode}
                  </span>
                )}
              </div>

              <div className="status-indicators">
                {question.hasAcceptedAnswer ? (
                  <span className="status-badge status-badge--accepted">
                    ✓ Accepted Answer
                  </span>
                ) : question.isAnswered ? (
                  <span className="status-badge status-badge--answered">
                    Answered
                  </span>
                ) : (
                  <span className="status-badge status-badge--unanswered">
                    Unanswered
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* AC 3: Question Description */}
        <div className="question-body">
          <div
            className="question-description"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />
        </div>

        {/* AC 4: Question Metadata Actions */}
        <div className="question-actions">
          <div className="actions-left">
            <span className="action-stat">
              {question.answerCount}{" "}
              {question.answerCount === 1 ? "Answer" : "Answers"}
            </span>
            <span className="action-stat">
              {question.commentCount}{" "}
              {question.commentCount === 1 ? "Comment" : "Comments"}
            </span>
          </div>

          <div className="actions-right">
            <button
              className={`action-button ${
                question.isBookmarked ? "action-button--active" : ""
              }`}
              onClick={() => onBookmark(question.id)}
              title="Bookmark this question"
            >
              <span className="action-icon">
                {question.isBookmarked ? "★" : "☆"}
              </span>
              Bookmark
            </button>

            <button
              className="action-button"
              onClick={() => onShare(question.id)}
              title="Share this question"
            >
              <span className="action-icon">↗</span>
              Share
            </button>

            <button
              className="action-button"
              onClick={() => onReport("question", question.id)}
              title="Report or flag this question"
            >
              <span className="action-icon">⚑</span>
              Report
            </button>

            {isAuthor && (
              <>
                <button
                  className="action-button action-button--edit"
                  onClick={() => onEdit(question.id)}
                  title="Edit your question"
                >
                  <span className="action-icon">✎</span>
                  Edit
                </button>

                <button
                  className="action-button action-button--danger"
                  onClick={() => onDelete(question.id)}
                  title="Delete your question"
                >
                  <span className="action-icon">×</span>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Answers Section */}
        {answers.length > 0 && (
          <div className="answers-section">
            <h2 className="answers-header">
              {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
            </h2>

            {answers.map((answer) => (
              <div
                key={answer.id}
                className={`answer-card ${
                  answer.isAccepted ? "answer-card--accepted" : ""
                }`}
              >
                {answer.isAccepted && (
                  <div className="answer-accepted-badge">✓ Accepted Answer</div>
                )}

                <div className="answer-content">
                  <div className="vote-section">
                    <button
                      className="vote-button vote-button--up"
                      onClick={() => onVote("answer", answer.id, "up")}
                    >
                      ▲
                    </button>
                    <span className="vote-count">{answer.voteCount}</span>
                    <button
                      className="vote-button vote-button--down"
                      onClick={() => onVote("answer", answer.id, "down")}
                    >
                      ▼
                    </button>
                  </div>

                  <div className="answer-body">
                    <div
                      className="answer-text"
                      dangerouslySetInnerHTML={{ __html: answer.body }}
                    />

                    <div className="answer-footer">
                      <span className="answer-time">
                        Answered {formatTimeAgo(answer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AC 2: Author Information Sidebar */}
      <aside className="question-sidebar">
        <div className="author-card">
          <h3 className="author-card-title">
            {question.isAnonymous ? "Posted by" : "Asked by"}
          </h3>

          <div className="author-info">
            <img
              src={
                displayAuthor?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayAuthor?.username}`
              }
              alt={displayAuthor?.username}
              className="author-avatar"
            />

            <div className="author-details">
              <div className="author-name-row">
                {question.isAnonymous ? (
                  <span className="author-name author-name--anonymous">
                    {displayAuthor?.username}
                  </span>
                ) : (
                  <a
                    href={`/users/${question.authorId}`}
                    className="author-name"
                  >
                    {displayAuthor?.username}
                  </a>
                )}

                {!question.isAnonymous && displayAuthor?.isProfessor && (
                  <span
                    className="verification-badge verification-badge--professor"
                    title="Verified Professor"
                  >
                    👨‍🏫 Professor
                  </span>
                )}
                {!question.isAnonymous && displayAuthor?.isTA && (
                  <span
                    className="verification-badge verification-badge--ta"
                    title="Teaching Assistant"
                  >
                    🎓 TA
                  </span>
                )}
              </div>

              {!question.isAnonymous && (
                <div className="author-reputation">
                  <span className="reputation-icon">⭐</span>
                  <span className="reputation-score">
                    {displayAuthor?.reputation?.toLocaleString()} reputation
                  </span>
                </div>
              )}

              <div className="author-posted-time">
                Asked on{" "}
                {new Date(question.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default QuestionDetailPage;
