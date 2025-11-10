import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionData();
  }, [id]);

  const fetchQuestionData = async () => {
    try {
      // Call Flask API
      const response = await fetch(`http://localhost:5001/api/questions/${id}`);
      const data = await response.json();

      setQuestion(data.question);
      setAnswers(data.answers || []);
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching question:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type, targetId, direction) => {
    try {
      await fetch(`http://localhost:5001/api/${type}s/${targetId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      fetchQuestionData(); // Retrieve data again
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleBookmark = async (questionId) => {
    try {
      await fetch(
        `http://localhost:5001/api/questions/${questionId}/bookmark`,
        {
          method: "POST",
        }
      );
      fetchQuestionData();
    } catch (error) {
      console.error("Error bookmarking:", error);
    }
  };

  const handleEdit = (questionId) => {
    window.location.href = `/questions/${questionId}/edit`;
  };

  const handleDelete = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await fetch(`http://localhost:5001/api/questions/${questionId}`, {
          method: "DELETE",
        });
        window.location.href = "/";
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const handleShare = (questionId) => {
    const url = `${window.location.origin}/questions/${questionId}`;
    navigator.clipboard.writeText(url);
    alert("The link has been copied to the clipboard！");
  };

  const handleReport = (type, targetId) => {
    alert(`report${type}: ${targetId}`);
    // TODO: Implement a reporting feature
  };

  const handleTagClick = (tagId) => {
    window.location.href = `/tags?filter=${tagId}`;
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading..</div>
    );
  }

  if (!question) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        No issues found.
      </div>
    );
  }

  return (
    <QuestionDetailPage
      question={question}
      answers={answers}
      comments={comments}
      currentUser={{
        id: "user123",
        username: "John Doe",
        reputation: 1500,
        email: "john@example.com",
      }}
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

export default QuestionDetail;
