import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditQuestionPage from "./EditQuestionPage";
import API_BASE_URL from "../../constants/apiConfig";

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [originalQuestion, setOriginalQuestion] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [requiresReview, setRequiresReview] = useState(false);
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

  // Load question data for editing (AC 2)
  const loadQuestion = useCallback(async () => {
    try {
      setQuestionLoading(true);
      const response = await fetch(`${API_BASE_URL}/questions/${id}/edit`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403) {
          showNotification(
            "You do not have permission to edit this question",
            "error"
          );
          navigate(`/questions/${id}`);
          return;
        }
        throw new Error(`Failed to load question: ${response.status}`);
      }

      const data = await response.json();
      console.log("Question data for editing:", data);

      setOriginalQuestion(data.question);
      setCanEdit(data.can_edit);
      setRequiresReview(data.requires_review);

      if (data.requires_review) {
        showNotification(
          "Note: This edit may require moderator review",
          "info"
        );
      }
    } catch (error) {
      console.error("Error loading question:", error);
      showNotification("Failed to load question for editing", "error");
      navigate(`/questions/${id}`);
    } finally {
      setQuestionLoading(false);
    }
  }, [id, navigate]);

  // Load tags
  const loadTags = useCallback(async () => {
    try {
      setTagsLoading(true);
      const response = await fetch(`${API_BASE_URL}/tags`, {
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

      const transformedTags = data.tags.map((tag) => ({
        id: tag.id,
        name: tag.tag_name,
        description: tag.tag_description || tag.tag_name,
        isPersonal: false,
      }));

      setAvailableTags(transformedTags);
    } catch (error) {
      console.error("Error loading tags:", error);
      showNotification("Failed to load tags", "error");
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestion();
    loadTags();
  }, [loadQuestion, loadTags]);

  // Handle form submission (AC 5)
  const handleSubmit = async (questionData, editReason) => {
    try {
      console.log("Submitting edit...");

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to edit questions");
      }

      // Transform data to match backend expectations
      const backendData = {
        title: questionData.title,
        body: questionData.description,
        tag_ids: questionData.tags.map((tag) => parseInt(tag)),
        edit_reason: editReason,
        last_known_update:
          originalQuestion.updated_at || originalQuestion.created_at,
      };

      console.log("Sending update to backend:", backendData);

      const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(backendData),
      });

      console.log("Response status:", response.status);

      // Handle concurrent edit (AC 9)
      if (response.status === 409) {
        const errorData = await response.json();
        showNotification(
          errorData.error ||
            "This question was edited by someone else. Please refresh and try again.",
          "error"
        );

        // Prompt user to refresh
        if (
          window.confirm(
            "The question has been modified. Refresh to see the latest version?"
          )
        ) {
          window.location.reload();
        }
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON:", text.substring(0, 200));
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Backend response:", result);

      if (response.ok) {
        showNotification("Question updated successfully!", "success");

        // Navigate back to question detail page
        setTimeout(() => {
          navigate(`/questions/${id}`);
        }, 1500);

        return result;
      } else {
        // Handle validation errors (AC 4)
        if (result.errors) {
          throw new Error(Object.values(result.errors).join(", "));
        }
        throw new Error(
          result.error || `Failed to update question: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      showNotification(error.message, "error");
      throw error;
    }
  };

  // Handle cancel (AC 6)
  const handleCancel = (hasUnsavedChanges) => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Discard them?")) {
        navigate(`/questions/${id}`);
      }
    } else {
      navigate(`/questions/${id}`);
    }
  };

  // Create tag
  const handleCreateTag = async (tagName) => {
    try {
      if (!tagName.trim()) {
        throw new Error("Tag name cannot be empty");
      }

      const tagData = {
        tag_name: tagName.trim().toLowerCase(),
        tag_description: `User-created tag: ${tagName}`,
      };

      const response = await fetch(`${API_BASE_URL}/tags`, {
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

      const newTag = {
        id: result.tag.id,
        name: result.tag.tag_name,
        description: result.tag.tag_description,
        isPersonal: true,
      };

      setAvailableTags((prev) => [...prev, newTag]);
      showNotification("Tag created successfully!", "success");
      return newTag;
    } catch (error) {
      console.error("Tag creation error:", error);
      showNotification(`Failed to create tag: ${error.message}`, "error");
      throw error;
    }
  };

  // Get user ID
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = userData.id || null;

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
              notification.type === "success"
                ? "#10b981"
                : notification.type === "error"
                ? "#ef4444"
                : "#3b82f6",
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
            {notification.type === "success"
              ? "✓"
              : notification.type === "error"
              ? "⚠"
              : "ℹ"}
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

      {/* Loading state */}
      {tagsLoading || questionLoading ? (
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
          <p>Loading...</p>
        </div>
      ) : originalQuestion && canEdit ? (
        <EditQuestionPage
          availableTags={availableTags}
          originalQuestion={originalQuestion}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onCreateTag={handleCreateTag}
          currentUserId={currentUserId}
          requiresReview={requiresReview}
          showToast={showNotification}
        />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <p>Unable to load question for editing</p>
        </div>
      )}
    </>
  );
};

export default EditQuestion;
