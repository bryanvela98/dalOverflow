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

  // Temporary mock tags until backend is ready
  const mockTags = [
    { id: "1", name: "javascript", description: "JavaScript programming" },
    { id: "2", name: "react", description: "React.js framework" },
    { id: "3", name: "nodejs", description: "Node.js backend" },
    { id: "4", name: "css", description: "CSS styling" },
    { id: "5", name: "html", description: "HTML markup" },
    { id: "6", name: "python", description: "Python programming" },
    { id: "7", name: "java", description: "Java programming" },
    { id: "8", name: "sql", description: "SQL databases" },
  ];

  // FIXED: Handle form submission with actual database
  const handleSubmit = async (questionData) => {
    try {
      console.log("🔄 Starting submission...");

      const backendData = {
        user_id: "user123", // Make sure this matches your user ID format
        title: questionData.title,
        body: questionData.description,
        tags: questionData.tags, // This should be an array of tag IDs
      };

      console.log("📤 Sending to API:", backendData);

      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        // Try to get error message from response
        const errorText = await response.text();
        console.error("❌ Server error response:", errorText);
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Success response:", result);

      showNotification("Question created successfully!", "success");

      setTimeout(() => {
        navigate(`/questions/${result.question.id}`);
      }, 1500);

      return result;
    } catch (error) {
      console.error("❌ Submission error:", error);
      showNotification(error.message, "error");
      throw error;
    }
  };

  // FIXED: Search similar questions - use simple mock for now
  const handleSearchSimilar = async (title) => {
    try {
      if (!title.trim() || title.length < 5) {
        return [];
      }

      console.log("🔍 Searching similar questions:", title);

      // Simple mock implementation
      const mockSimilarQuestions = [
        {
          id: "1",
          title: "How to implement user authentication in React?",
          similarity: 0.85,
          voteCount: 25,
          answerCount: 5,
          viewCount: 350,
        },
        {
          id: "2",
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
      console.error("❌ Search error:", error);
      return [];
    }
  };

  // FIXED: Create tag - use mock for now
  const handleCreateTag = async (tagName) => {
    try {
      if (!tagName.trim()) {
        throw new Error("Tag name cannot be empty");
      }

      console.log("🏷️ Creating tag:", tagName);

      // Mock tag creation for now
      const newTag = {
        id: `tag-${Date.now()}`,
        name: tagName.trim().toLowerCase(),
        description: `User-created tag: ${tagName}`,
        isPersonal: true,
      };

      await new Promise((resolve) => setTimeout(resolve, 200));
      return newTag;
    } catch (error) {
      console.error("❌ Tag creation error:", error);
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  };

  // Use mock tags until backend is ready
  const [availableTags, setAvailableTags] = useState(mockTags);

  // Get actual user ID
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = userData.id || "user123";

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
