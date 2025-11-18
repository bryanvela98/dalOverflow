import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CreateQuestionPage from "./CreateQuestionPage";

const CreateQuestion = () => {
  const navigate = useNavigate();
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
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

  const loadTags = useCallback(async () => {
    try {
      setTagsLoading(true);
      const response = await fetch("http://localhost:5001/api/tags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status}`);
      }

      const data = await response.json();
      console.log("Tags from backend:", data);

      // Transform backend tags to match frontend expectations
      const transformedTags = data.tags.map((tag) => ({
        id: tag.id,
        name: tag.tag_name,
        description: tag.tag_description || tag.tag_name,
        isPersonal: false, // Default to false for DB tags
      }));

      setAvailableTags(transformedTags);
    } catch (error) {
      console.error("Error loading tags:", error);
      showNotification("Failed to load tags. Using default tags.", "error");

      // Fallback to some basic tags if API fails
      setAvailableTags([
        {
          id: 1,
          name: "javascript",
          description: "JavaScript programming",
          isPersonal: false,
        },
        {
          id: 2,
          name: "react",
          description: "React.js framework",
          isPersonal: false,
        },
        {
          id: 3,
          name: "python",
          description: "Python programming",
          isPersonal: false,
        },
      ]);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  // Load tags from backend on component mount
  useEffect(() => {
    loadTags();
  }, [loadTags]);

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

      const response = await fetch(
        `http://localhost:5001/api/questions/search?query=${encodeURIComponent(
          title.trim()
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      // Simple transformation - backend already sorted by score
      return data.results.slice(0, 5).map((question) => ({
        id: question.id,
        title: question.title,
        similarity: question.score,
      }));
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  };

  // FIXED: Create tag with real API call
  const handleCreateTag = async (tagName) => {
    try {
      if (!tagName.trim()) {
        throw new Error("Tag name cannot be empty");
      }

      console.log("Creating tag:", tagName);

      const tagData = {
        tag_name: tagName.trim().toLowerCase(),
        tag_description: `User-created tag: ${tagName}`,
      };

      const response = await fetch("http://localhost:5001/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(tagData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to create tag: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("Tag created successfully:", result);

      // Transform the response to match frontend expectations
      const newTag = {
        id: result.tag.id,
        name: result.tag.tag_name,
        description: result.tag.tag_description,
        isPersonal: true,
      };

      // Add the new tag to the available tags list
      setAvailableTags((prev) => [...prev, newTag]);

      showNotification("Tag created successfully!", "success");
      return newTag;
    } catch (error) {
      console.error("Tag creation error:", error);
      showNotification(`Failed to create tag: ${error.message}`, "error");
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  };

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

      {/* Show loading state while fetching tags */}
      {tagsLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTopColor: "#2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px",
            }}
          />
          <p>Loading tags...</p>
        </div>
      ) : (
        <CreateQuestionPage
          availableTags={availableTags}
          userPersonalTags={[]}
          onSubmit={handleSubmit}
          onSearchSimilar={handleSearchSimilar}
          onCreateTag={handleCreateTag}
          currentUserId={currentUserId}
          showToast={showNotification}
        />
      )}
    </>
  );
};

export default CreateQuestion;
