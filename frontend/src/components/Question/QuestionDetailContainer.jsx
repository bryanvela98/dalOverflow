import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionDetailPage from "./QuestionDetailPage";

const QuestionDetailContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = {
    id: "user123",
    username: "Current User",
    email: "user@dal.ca",
    reputation: 1500,
  };

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts

    const loadQuestionData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5001/api/questions/${id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch question: ${response.status}`);
        }

        const data = await response.json();
        console.log("Backend data:", data);

        if (isMounted) {
          // Transform backend data to match frontend expectations
          const transformedQuestion = transformQuestionData(data.question);
          const transformedAnswers = transformAnswersData(data.answers || []);

          setQuestion(transformedQuestion);
          setAnswers(transformedAnswers);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        if (isMounted) {
          setError("Failed to load question. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadQuestionData();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [id]);

  // Separate loadQuestionData function for manual reload
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

      // Transform backend data to match frontend expectations
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

  // Transform backend question data to match frontend component expectations
  const transformQuestionData = (backendQuestion) => {
    if (!backendQuestion) return null;

    return {
      id: backendQuestion.id,
      title: backendQuestion.title,
      description: backendQuestion.body, // Map body to description
      body: backendQuestion.body,
      author: {
        id: backendQuestion.user_id,
        username: `User ${backendQuestion.user_id}`,
        reputation: 1500, // Default value
      },
      tags: backendQuestion.tags
        ? backendQuestion.tags.map((tag) => ({
            id: tag.id,
            name: tag.tag_name, // Use tag_name from backend
            description: tag.tag_description || "",
          }))
        : [],
      voteCount: 0, // Add default values
      viewCount: backendQuestion.view_count || 0,
      commentCount: 0,
      answerCount: backendQuestion.answers ? backendQuestion.answers.length : 0,
      isAnswered: backendQuestion.answers && backendQuestion.answers.length > 0,
      hasAcceptedAnswer: false,
      isBookmarked: false,
      isAnonymous: false,
      courseCode: "CSCI 3130", // Default value
      createdAt: backendQuestion.created_at,
      updatedAt: backendQuestion.updated_at,
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

  // ... rest of your handlers (vote, bookmark, etc.) remain the same
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

  const handleEdit = (questionId) => {
    navigate(`/questions/${questionId}/edit`);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
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

  const handleShare = (questionId) => {
    const url = `${window.location.origin}/questions/${questionId}`;

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
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Link copied to clipboard!");
      });
  };

  const handleReport = async (type, targetId) => {
    const reason = prompt(`Reason for reporting this ${type}:`);
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

  const handleTagClick = (tagName) => {
    navigate(`/tags/${tagName}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Question</h2>
        <p>{error}</p>
        <button onClick={loadQuestionData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="not-found-container">
        <h2>Question not found</h2>
        <p>The question you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")} className="home-button">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <QuestionDetailPage
      question={question}
      answers={answers}
      currentUser={currentUser}
      onVote={handleVote}
      onBookmark={handleBookmark}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onShare={handleShare}
      onReport={handleReport}
      onTagClick={handleTagClick}
    />
  );
};

export default QuestionDetailContainer;
