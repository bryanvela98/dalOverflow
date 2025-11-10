import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateQuestionPage from "./CreateQuestionPage";

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Show notification helper
  const showNotification = (message, type) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 5000);
  };

  // Mock tags data - make sure these match your database tag IDs
  const mockTags = [
    { id: 1, name: "javascript", description: "JavaScript programming" },
    { id: 2, name: "react", description: "React.js framework" },
    { id: 3, name: "nodejs", description: "Node.js backend" },
    { id: 4, name: "css", description: "CSS styling" },
    { id: 5, name: "html", description: "HTML markup" },
    { id: 6, name: "python", description: "Python programming" },
  ];

  // FIXED: Handle form submission with correct data structure
  const handleSubmit = async (questionData) => {
    try {
      console.log("Starting submission...");

      // Get actual user data from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id || 6; // Fallback to 6 as in your example

      // Transform data to match backend expectations EXACTLY
      const backendData = {
        type: "technical", // Required field
        user_id: userId, // Number, not string
        title: questionData.title,
        body: questionData.description, // Changed from description to body
        tag_ids: questionData.tags.map((tag) => parseInt(tag)), // Changed from tags to tag_ids, array of numbers
        status: "open", // Required field
      };

      console.log("Sending to backend:", backendData);

      const response = await fetch("http://localhost:5001/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(backendData),
      });

      console.log("Response status:", response.status);

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON:", text.substring(0, 200));

        if (response.status === 404) {
          throw new Error(
            "Questions API endpoint not found. Check backend routes."
          );
        }
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Backend response:", result);

      if (response.ok) {
        showNotification("Question created successfully!", "success");

        // Navigate to the newly created question
        setTimeout(() => {
          if (result.question && result.question.id) {
            navigate(`/questions/${result.question.id}`);
          } else {
            navigate("/questions");
          }
        }, 1500);

        return result;
      } else {
        throw new Error(
          result.error || `Failed to create question: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      showNotification(error.message, "error");
      throw error;
    }
  };

  // FIXED: Search similar questions
  const handleSearchSimilar = async (title) => {
    try {
      if (!title.trim() || title.length < 5) {
        return [];
      }

      console.log("Searching similar questions:", title);

      // Mock implementation for now
      const mockSimilarQuestions = [
        {
          id: 1,
          title: "How to implement user authentication in React?",
          similarity: 0.85,
          voteCount: 25,
          answerCount: 5,
          viewCount: 350,
        },
        {
          id: 2,
          title: "React authentication best practices",
          similarity: 0.72,
          voteCount: 18,
          answerCount: 3,
          viewCount: 220,
        },
      ].filter((q) => q.title.toLowerCase().includes(title.toLowerCase()));

      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockSimilarQuestions;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  // FIXED: Create tag
  const handleCreateTag = async (tagName) => {
    try {
      if (!tagName.trim()) {
        throw new Error("Tag name cannot be empty");
      }

      console.log("Creating tag:", tagName);

      // Mock tag creation for now
      const newTag = {
        id: Date.now(),
        name: tagName.trim().toLowerCase(),
        description: `User-created tag: ${tagName}`,
        isPersonal: true,
      };

      await new Promise((resolve) => setTimeout(resolve, 200));
      return newTag;
    } catch (error) {
      console.error("Tag creation error:", error);
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  };

  // Use mock tags until backend is ready
  const [availableTags, setAvailableTags] = useState(mockTags);

  // Get actual user ID
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = userData.id || 6;

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div
          className={`notification ${notification.type}`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "16px 24px",
            borderRadius: "8px",
            backgroundColor:
              notification.type === "success" ? "#10b981" : "#ef4444",
            color: "white",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span style={{ fontSize: "20px" }}>
            {notification.type === "success" ? "✓" : "⚠"}
          </span>
          <span>{notification.message}</span>
          <button
            onClick={() =>
              setNotification({ show: false, type: "", message: "" })
            }
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <CreateQuestionPage
        availableTags={availableTags}
        userPersonalTags={[]}
        onSubmit={handleSubmit}
        onSearchSimilar={handleSearchSimilar}
        onCreateTag={handleCreateTag}
        currentUserId={currentUserId}
        showToast={showNotification}
      />
    </>
  );
};

export default CreateQuestion;
