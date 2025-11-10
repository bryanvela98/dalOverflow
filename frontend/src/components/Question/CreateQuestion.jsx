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
    }, 3000);
  };

  // Simulated tag data
  const mockTags = [
    {
      id: "tag-1",
      name: "javascript",
      description: "For questions about JavaScript programming",
      isPersonal: false,
    },
    {
      id: "tag-2",
      name: "react",
      description: "For React.js related questions",
      isPersonal: false,
    },
    {
      id: "tag-3",
      name: "nodejs",
      description: "For Node.js backend questions",
      isPersonal: false,
    },
    {
      id: "tag-4",
      name: "css",
      description: "For CSS styling questions",
      isPersonal: false,
    },
    {
      id: "tag-5",
      name: "html",
      description: "For HTML markup questions",
      isPersonal: false,
    },
    {
      id: "tag-6",
      name: "python",
      description: "For Python programming questions",
      isPersonal: false,
    },
    {
      id: "tag-7",
      name: "java",
      description: "For Java programming questions",
      isPersonal: false,
    },
    {
      id: "tag-8",
      name: "typescript",
      description: "For TypeScript questions",
      isPersonal: false,
    },
    {
      id: "tag-9",
      name: "mongodb",
      description: "For MongoDB database questions",
      isPersonal: false,
    },
    {
      id: "tag-10",
      name: "express",
      description: "For Express.js framework questions",
      isPersonal: false,
    },
    {
      id: "tag-11",
      name: "vue",
      description: "For Vue.js questions",
      isPersonal: false,
    },
    {
      id: "tag-12",
      name: "angular",
      description: "For Angular questions",
      isPersonal: false,
    },
    {
      id: "tag-13",
      name: "sql",
      description: "For SQL database questions",
      isPersonal: false,
    },
    {
      id: "tag-14",
      name: "git",
      description: "For Git version control questions",
      isPersonal: false,
    },
    {
      id: "tag-15",
      name: "docker",
      description: "For Docker containerization questions",
      isPersonal: false,
    },
    {
      id: "tag-16",
      name: "aws",
      description: "For Amazon Web Services questions",
      isPersonal: false,
    },
    {
      id: "tag-17",
      name: "api",
      description: "For API development questions",
      isPersonal: false,
    },
    {
      id: "tag-18",
      name: "rest",
      description: "For RESTful API questions",
      isPersonal: false,
    },
    {
      id: "tag-19",
      name: "graphql",
      description: "For GraphQL questions",
      isPersonal: false,
    },
    {
      id: "tag-20",
      name: "authentication",
      description: "For authentication and security questions",
      isPersonal: false,
    },
    {
      id: "tag-21",
      name: "database",
      description: "For general database questions",
      isPersonal: false,
    },
    {
      id: "tag-22",
      name: "frontend",
      description: "For frontend development questions",
      isPersonal: false,
    },
    {
      id: "tag-23",
      name: "backend",
      description: "For backend development questions",
      isPersonal: false,
    },
    {
      id: "tag-24",
      name: "fullstack",
      description: "For full-stack development questions",
      isPersonal: false,
    },
    {
      id: "tag-25",
      name: "debugging",
      description: "For debugging and troubleshooting questions",
      isPersonal: false,
    },
    {
      id: "tag-26",
      name: "performance",
      description: "For performance optimization questions",
      isPersonal: false,
    },
    {
      id: "tag-27",
      name: "testing",
      description: "For testing and QA questions",
      isPersonal: false,
    },
    {
      id: "tag-28",
      name: "deployment",
      description: "For deployment questions",
      isPersonal: false,
    },
    {
      id: "tag-29",
      name: "security",
      description: "For security questions",
      isPersonal: false,
    },
    {
      id: "tag-30",
      name: "algorithms",
      description: "For algorithms and data structures",
      isPersonal: false,
    },
  ];

  const handleSubmit = async (questionData) => {
    try {
      // Development mode: simulate backend response
      const DEV_MODE = true; // Set to false when backend is ready

      if (DEV_MODE) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock successful response
        const mockQuestionId = `q-${Date.now()}`;

        const newQuestion = {
          id: mockQuestionId,
          title: questionData.title,
          description: questionData.description,
          tags: questionData.tags,
          votes: 0,
          answers: 0,
          views: 0,
          isAnswered: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: "user123",
            name: questionData.isAnonymous
              ? "Anonymous Dalhousie Student"
              : "Current User",
          },
        };

        // store to localStorage
        const existingQuestions = JSON.parse(
          localStorage.getItem("userQuestions") || "[]"
        );
        const updatedQuestions = [newQuestion, ...existingQuestions];
        localStorage.setItem("userQuestions", JSON.stringify(updatedQuestions));

        console.log("Question saved to localStorage:", newQuestion);

        // display success
        showNotification("Question created successfully!", "success");

        setTimeout(() => {
          navigate("/questions", { state: { refresh: true } });
        }, 1500);

        // Return mock response
        return newQuestion;
      }

      // Production mode: real API call
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        const data = await response.json();
        showNotification("Question created successfully!", "success");
        setTimeout(() => {
          navigate("/questions", { state: { refresh: true } });
        }, 1500);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create question");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(error.message || "Failed to create question", "error");
      throw error;
    }
  };

  const handleSearchSimilar = async (title) => {
    // Development mode: return mock data
    const DEV_MODE = true;

    if (DEV_MODE) {
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
        {
          id: "3",
          title: "JWT token authentication in Node.js",
          similarity: 0.65,
          voteCount: 12,
          answerCount: 2,
          viewCount: 180,
        },
      ].filter((q) => q.title.toLowerCase().includes(title.toLowerCase()));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockSimilarQuestions;
    }

    // Production mode
    try {
      const response = await fetch(
        `/api/questions/similar?title=${encodeURIComponent(title)}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      return data.similar_questions || [];
    } catch (error) {
      console.error("Error searching similar questions:", error);
      return [];
    }
  };

  const handleCreateTag = async (tagName) => {
    try {
      //  mock tag
      const DEV_MODE = true;

      if (DEV_MODE) {
        const newTag = {
          id: `tag-${Date.now()}`,
          name: tagName,
          description: `Custom tag: ${tagName}`,
          isPersonal: true,
        };
        return newTag;
      }

      // call API
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ name: tagName }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error("Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  };

  return (
    <>
      {/* Task 33: Notification Component */}
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
            × ×
          </button>
        </div>
      )}

      <CreateQuestionPage
        availableTags={mockTags}
        userPersonalTags={[]}
        onSubmit={handleSubmit}
        onSearchSimilar={handleSearchSimilar}
        onCreateTag={handleCreateTag}
        currentUserId="user123"
        showToast={showNotification}
      />
    </>
  );
};

export default CreateQuestion;
