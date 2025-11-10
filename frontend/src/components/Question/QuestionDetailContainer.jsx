import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QuestionDetailPage from "./QuestionDetailPage";

/**
 * Question Detail Container
 */
const QuestionDetailContainer = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = {
    id: "user123",
    username: "Current User",
    email: "user@dal.ca",
  };

  useEffect(() => {
    loadQuestionData();
  }, [questionId]);

  const loadQuestionData = async () => {
    setLoading(true);

    try {
      const DEV_MODE = true;

      if (DEV_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock questions
        const mockQuestion = {
          id: questionId,
          title:
            "How to implement user authentication in Node.js with Express?",
          description: `
            <p>I'm trying to implement user authentication in my Node.js application using Express. I need to:</p>
            <ul>
              <li>Hash passwords securely</li>
              <li>Generate JWT tokens</li>
              <li>Protect routes</li>
            </ul>
            <p>What's the best approach for this?</p>
          `,
          author: {
            id: 1,
            username: "John Doe",
            avatar: null,
            reputation: 1250,
            isProfessor: false,
            isTA: true,
          },
          authorId: 1,
          tags: [
            {
              id: 1,
              name: "javascript",
              description: "JavaScript programming",
            },
            { id: 2, name: "nodejs", description: "Node.js backend" },
            { id: 3, name: "express", description: "Express framework" },
            {
              id: 4,
              name: "authentication",
              description: "Authentication and security",
            },
          ],
          voteCount: 25,
          viewCount: 350,
          commentCount: 3,
          answerCount: 4,
          isAnswered: true,
          hasAcceptedAnswer: true,
          isBookmarked: false,
          isAnonymous: false,
          courseCode: "CSCI 3130",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T14:20:00Z",
        };

        // Mock answers
        const mockAnswers = [
          {
            id: "answer-1",
            questionId: questionId,
            body: `
              <p>You should use bcrypt to hash passwords and JWT for token generation. Here's a complete example:</p>
              <pre>const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});</pre>
            `,
            author: {
              id: 2,
              name: "Jane Smith",
              username: "Jane Smith",
            },
            voteCount: 15,
            isAccepted: true,
            createdAt: "2024-01-15T11:00:00Z",
          },
          {
            id: "answer-2",
            questionId: questionId,
            body: `
              <p>Don't forget to add middleware to protect your routes:</p>
              <pre>const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ userId: req.user.userId });
});</pre>
            `,
            author: {
              id: 3,
              name: "Anonymous",
              username: "Anonymous",
            },
            voteCount: 8,
            isAccepted: false,
            createdAt: "2024-01-15T12:30:00Z",
          },
        ];

        // upload submitted answers
        const userAnswers = JSON.parse(
          localStorage.getItem("userAnswers") || "[]"
        );
        const questionAnswers = userAnswers.filter(
          (a) => a.questionId === questionId
        );

        console.log("Loading user answers from localStorage:", questionAnswers);
        console.log("Loading mock answers:", mockAnswers);

        const allAnswers = [...questionAnswers, ...mockAnswers];

        console.log("All answers combined:", allAnswers);

        setQuestion(mockQuestion);
        setAnswers(allAnswers);
      }
    } catch (error) {
      console.error("Failed to load question:", error);
    } finally {
      setLoading(false);
    }
  };

  // vote logic
  const handleVote = (type, id, direction) => {
    console.log(`Vote ${direction} on ${type} ${id}`);

    if (type === "question") {
      setQuestion((prev) => {
        if (!prev) return prev;

        const currentVote = prev.voteCount || 0;
        const newVote = direction === "up" ? currentVote + 1 : currentVote - 1;

        // vote localStorage
        const votes = JSON.parse(localStorage.getItem("userVotes") || "{}");
        votes[`question-${id}`] = direction;
        localStorage.setItem("userVotes", JSON.stringify(votes));

        return {
          ...prev,
          voteCount: newVote,
        };
      });
    } else if (type === "answer") {
      setAnswers((prev) => {
        return prev.map((answer) => {
          if (answer.id === id) {
            const currentVote = answer.voteCount || answer.votes || 0;
            const newVote =
              direction === "up" ? currentVote + 1 : currentVote - 1;

            // save vote localStorage
            const votes = JSON.parse(localStorage.getItem("userVotes") || "{}");
            votes[`answer-${id}`] = direction;
            localStorage.setItem("userVotes", JSON.stringify(votes));

            //update answers' vote localStorage
            const userAnswers = JSON.parse(
              localStorage.getItem("userAnswers") || "[]"
            );
            const updatedUserAnswers = userAnswers.map((a) => {
              if (a.id === id) {
                return {
                  ...a,
                  voteCount: newVote,
                  votes: newVote,
                };
              }
              return a;
            });
            localStorage.setItem(
              "userAnswers",
              JSON.stringify(updatedUserAnswers)
            );

            return {
              ...answer,
              voteCount: newVote,
              votes: newVote,
            };
          }
          return answer;
        });
      });
    }
  };

  const handleBookmark = (questionId) => {
    setQuestion((prev) => {
      if (!prev) return prev;

      const isBookmarked = !prev.isBookmarked;

      const bookmarks = JSON.parse(
        localStorage.getItem("userBookmarks") || "[]"
      );
      if (isBookmarked) {
        bookmarks.push(questionId);
      } else {
        const index = bookmarks.indexOf(questionId);
        if (index > -1) {
          bookmarks.splice(index, 1);
        }
      }
      localStorage.setItem("userBookmarks", JSON.stringify(bookmarks));

      return {
        ...prev,
        isBookmarked,
      };
    });
  };

  const handleShare = (questionId) => {
    const url = window.location.href;

    // Web Share API
    if (navigator.share) {
      navigator
        .share({
          title: question?.title,
          url: url,
        })
        .then(() => {
          console.log("Shared successfully");
        })
        .catch((error) => {
          console.log("Error sharing:", error);
          copyToClipboard(url);
        });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy:", error);
      });
  };

  const handleReport = (type, id) => {
    const confirmed = window.confirm(
      `Are you sure you want to report this ${type}?`
    );
    if (confirmed) {
      console.log(`Reported ${type} ${id}`);
      alert(`Thank you for reporting. Our team will review this ${type}.`);
    }
  };

  const handleEdit = (questionId) => {
    console.log(`Edit question ${questionId}`);
    alert("Edit functionality coming soon!");
  };

  const handleDelete = (questionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question? This action cannot be undone."
    );
    if (confirmed) {
      console.log(`Delete question ${questionId}`);
      alert("Question deleted successfully!");
    }
  };

  const handleTagClick = (tagId) => {
    console.log(`Tag clicked: ${tagId}`);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          textAlign: "center",
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
        <p>Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          textAlign: "center",
        }}
      >
        <h2>Question not found</h2>
        <p>The question you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <QuestionDetailPage
      question={question}
      answers={answers}
      comments={[]}
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
