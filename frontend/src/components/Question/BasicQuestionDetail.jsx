import React, { useState, useEffect } from "react";
import apiFetch from "../../utils/api";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "react-quill/dist/quill.snow.css";
import "./BasicQuestionDetail.css";
import AiAnsSec from "./aiAns";
import AiSummariseSec from "./aiSummarise";
import API_BASE_URL from "../../constants/apiConfig";
import { useNavigate } from "react-router-dom";

const BasicQuestionDetail = () => {
  const { id } = useParams();
  const draftKey = `draftAnswer_${id}`;
  const [question, setQuestion] = useState(null);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const navigate = useNavigate();
  const [canEdit, setCanEdit] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editAnswerContent, setEditAnswerContent] = useState("");
  const [editAnswerReason, setEditAnswerReason] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const editQuillRef = React.useRef(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [ansContent, setAnsContent] = useState("");
  const [isSubmitAns, setIsSubmitAns] = useState(false);
  const [ansErr, setAnsErr] = useState("");
  const [ansSuccess, setAnsSuccess] = useState("");
  const ansForm = React.useRef(null);
  const ansList = React.useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const quillRef = React.useRef(null);
  const previousCodeBlockCount = React.useRef(0);
  const codeBlockLanguages = React.useRef({});
  const [quesVote, setquesVote] = useState(null);
  const [ansVotes, setAnsVotes] = useState({});
  const [voteInProgress, setVoteInProgress] = useState(false);

  // Monitor for new code blocks and store their language
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const codeBlocks = editor.root.querySelectorAll(".ql-syntax");

      // If we have more code blocks than before, store language for new ones
      if (codeBlocks.length > previousCodeBlockCount.current) {
        codeBlocks.forEach((block, index) => {
          // Only assign language to new blocks (those without an assigned language)
          if (!codeBlockLanguages.current[index]) {
            codeBlockLanguages.current[index] = selectedLanguage;
          }
        });
      }

      // If blocks were deleted, clean up the mapping
      if (codeBlocks.length < previousCodeBlockCount.current) {
        const newMapping = {};
        codeBlocks.forEach((block, index) => {
          newMapping[index] =
            codeBlockLanguages.current[index] || selectedLanguage;
        });
        codeBlockLanguages.current = newMapping;
      }

      previousCodeBlockCount.current = codeBlocks.length;
    }
  }, [ansContent]);

  const fetchAnswers = async () => {
    try {
      const answersResponse = await apiFetch(
        `${API_BASE_URL}/answers/questions/${id}/answers`
      );
      const answersData = await answersResponse.json();
      const answers = answersData.answers || [];

      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        answers: answers,
        answerCount: answers.length,
        isAnswered: answers.length > 0,
        hasAcceptedAnswer: answers.some((a) => a.isAccepted),
      }));

      return answers;
    } catch (error) {
      return [];
    }
  };

  const fetchRelatedQuestions = async (currentQuestionId, tags) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/questions`);
      const data = await response.json();
      const questions = data.questions || [];

      // Filter questions that share tags with current question, exclude current question
      const related = questions
        .filter((q) => q.id !== currentQuestionId)
        .filter((q) => {
          const qTags = q.tags || [];
          const hasCommonTag = tags.some((tag) => {
            const tagIdMatch = qTags.some((qTag) => {
              if (typeof tag === "object" && typeof qTag === "object") {
                return qTag.id === tag.id || qTag.name === tag.name;
              } else if (typeof tag === "string") {
                return qTag.name === tag || qTag.id === tag;
              }
              return false;
            });
            return tagIdMatch;
          });
          return hasCommonTag;
        })
        .slice(0, 3); // Get top 3 related questions

      setRelatedQuestions(related);
    } catch (error) {
      // Error fetching related questions
    }
  };

  useEffect(() => {
    // let isMounted = true;

    let isMounted = true;

    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft && isMounted) {
      setAnsContent(savedDraft);
    }

    const fetchQuestion = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/questions/${id}`);
        const data = await response.json();

        if (isMounted) {
          if (!data.question) {
            setLoading(false);
            return;
          }

          const answersResponse = await apiFetch(
            `${API_BASE_URL}/answers/questions/${id}/answers`
          );
          const answersData = await answersResponse.json();
          const answers = answersData.answers || [];

          const enhancedQuestion = {
            ...data.question,
            answers: answers,
            answerCount: answers.length,
            isAnswered: answers.length > 0,
            hasAcceptedAnswer: answers.some((a) => a.isAccepted),
          };

          setQuestion(enhancedQuestion);
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const canUserEdit =
            data.question.can_edit || currentUser.id === data.question.user_id;
          setCanEdit(canUserEdit);

          await fetchUserData(data.question, answers);

          // Fetch related questions based on tags
          if (data.question.tags && data.question.tags.length > 0) {
            fetchRelatedQuestions(data.question.id, data.question.tags);
          }
        }
      } catch (error) {
        // Error fetching question data
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchUserData = async (questionData, answers = []) => {
      if (!isMounted) return;

      const usersMap = {};
      const reputationMap = {};

      // Fetch vote data for question author's reputation
      if (questionData.user_id) {
        try {
          const voteResp = await apiFetch(
            `${API_BASE_URL}/votes/question/${questionData.id}`
          );
          if (voteResp.ok) {
            const voteJson = await voteResp.json();
            const upvotes = voteJson.upvotes || 0;
            const downvotes = voteJson.downvotes || 0;
            reputationMap[questionData.user_id] = upvotes * 10 - downvotes * 10;
          }
        } catch (e) {
          // Error fetching votes for question
        }
      }

      // Fetch vote data for each answer author's reputation
      for (const answer of answers) {
        if (answer.user_id && answer.id) {
          try {
            const voteResp = await apiFetch(
              `${API_BASE_URL}/votes/answer/${answer.id}`
            );
            if (voteResp.ok) {
              const voteJson = await voteResp.json();
              const upvotes = voteJson.upvotes || 0;
              const downvotes = voteJson.downvotes || 0;
              const answerRep = upvotes * 10 - downvotes * 10;

              // Add to existing reputation if user has multiple answers/questions
              reputationMap[answer.user_id] =
                (reputationMap[answer.user_id] || 0) + answerRep;
            }
          } catch (e) {
            // Error fetching votes for answer
          }
        }
      }

      // Collect all unique user IDs from question and answers
      const userIds = new Set();
      if (questionData.user_id) {
        userIds.add(questionData.user_id);
      }
      answers.forEach((answer) => {
        if (answer.user_id) {
          userIds.add(answer.user_id);
        }
      });

      // Fetch user data for each unique user ID
      for (const userId of userIds) {
        try {
          const response = await apiFetch(`${API_BASE_URL}/users/${userId}`);
          if (response.ok) {
            const userData = await response.json();

            // Use calculated reputation if available, otherwise use from database
            const reputation =
              reputationMap[userId] !== undefined
                ? reputationMap[userId]
                : userData?.user?.reputation || 0;

            usersMap[userId] = {
              ...userData?.user,
              username: userData?.user?.username || `User ${userId}`,
              reputation: reputation,
            };

            // Log answer count for logged in user
            const currentUser = JSON.parse(
              localStorage.getItem("currentUser") || "{}"
            );

            if (
              currentUser.id === userId &&
              userData?.user?.answer_count !== undefined
            ) {
            } else if (userData?.user?.answer_count !== undefined) {
            }
          } else {
            usersMap[userId] = {
              username: `User ${userId}`,
              reputation: 0,
            };
          }
        } catch (error) {
          usersMap[userId] = {
            username: `User ${userId}`,
            reputation: 0,
          };
        }
      }

      if (isMounted) {
        setUsers(usersMap);
      }
    };

    fetchQuestion();

    return () => {
      isMounted = false;
    };
    // }, [id]);
  }, [id, draftKey]);

  // grab users previous votes if any
  useEffect(() => {
    const fetchUserVotes = async () => {
      const uStr = localStorage.getItem("user");
      if (!uStr) return;
      const usr = JSON.parse(uStr);
      if (!usr.id) return;

      try {
        const resp = await apiFetch(
          `${API_BASE_URL}/votes/user?user_id=${usr.id}`
        );
        if (!resp.ok) return;
        const json = await resp.json();
        const allVotes = json.votes || [];

        // find question vote
        const qv = allVotes.find(
          (v) => v.target_type === "question" && v.target_id === parseInt(id)
        );
        if (qv) setquesVote({ type: qv.vote_type, id: qv.id });

        // map answer votes
        let aMap = {};
        allVotes.forEach((v) => {
          if (v.target_type === "answer")
            aMap[v.target_id] = { type: v.vote_type, id: v.id };
        });
        setAnsVotes(aMap);
      } catch (e) {
        // Error loading votes
      }
    };
    fetchUserVotes();
  }, [id]);

  // Add this NEW useEffect here:
  useEffect(() => {
    if (question && question.user_id) {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const isAuthor = currentUser.id === question.user_id;

      setCanEdit(isAuthor);
    }
  }, [question]);

  // get vote counts and calculate reputation
  useEffect(() => {
    if (!question) return;
    const getCounts = async () => {
      try {
        // question votes
        const qResp = await apiFetch(
          `${API_BASE_URL}/votes/question/${question.id}`
        );
        if (qResp.ok) {
          const json = await qResp.json();
          const upvotes = json.upvotes || 0;
          const downvotes = json.downvotes || 0;
          const voteCount = json.vote_count || 0;

          setQuestion((prev) => ({
            ...prev,
            voteCount: voteCount,
            upvotes: upvotes,
            downvotes: downvotes,
          }));
        }
        // answer votes
        if (question.answers?.length) {
          const withCounts = await Promise.all(
            question.answers.map(async (a) => {
              const aResp = await apiFetch(
                `${API_BASE_URL}/votes/answer/${a.id}`
              );
              if (aResp.ok) {
                const json = await aResp.json();
                return { ...a, upvotes: json.vote_count || 0 };
              }
              return a;
            })
          );
          setQuestion((prev) => ({ ...prev, answers: withCounts }));
        }
      } catch (e) {
        // Error fetching vote counts
      }
    };
    getCounts();
  }, [question?.id, question?.answers?.length]);

  const getAnsInpLen = (html) => {
    if (!html) return 0;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || "").trim().length;
  };
  // const handleEditClick = () => {
  // navigate(`/questions/${id}/edit`);
  // };

  const handleEditClick = (e) => {
    e.preventDefault(); // Add this!
    e.stopPropagation(); // Add this!
    navigate(`/questions/${id}/edit`);
  };

  //validate if 20 chars are inputted
  const isAnsLengVal = () => {
    const ansLength = getAnsInpLen(ansContent);
    return ansLength >= 20 && !isSubmitAns;
  };

  const getUserInfo = (userId) => {
    return (
      users[userId] || {
        username: `User ${userId}`,
        reputation: 0,
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const capitalizeFirstLetter = (html) => {
    if (!html) return html;
    // Create a temporary div to parse HTML
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText;
    if (!text) return html;
    // Capitalize first character of text and replace in HTML
    const firstChar = text.charAt(0).toUpperCase();
    return html.replace(text.charAt(0), firstChar);
  };

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(index);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleContentChange = (content) => {
    setAnsContent(content);
    if (ansErr) setAnsErr("");
    if (ansSuccess) setAnsSuccess("");
  };

  const extractCodeFromHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const preElements = doc.querySelectorAll("pre");
    return Array.from(preElements).map((pre, index) => {
      // Try to detect language from data attribute first
      let language = pre.getAttribute("data-language");

      // If no data attribute, try class attribute
      if (!language) {
        const codeElement = pre.querySelector("code");
        if (codeElement && codeElement.className) {
          // Check for language- prefix (e.g., language-python)
          const match = codeElement.className.match(/language-(\w+)/);
          if (match) {
            language = match[1];
          }
        } else if (pre.className) {
          // Check pre element class
          const match = pre.className.match(/language-(\w+)/);
          if (match) {
            language = match[1];
          }
        }
      }

      // Use default to 'javascript' if no language found
      if (!language) {
        language = "javascript";
      }

      // Capitalize first letter for display
      const displayLanguage =
        language.charAt(0).toUpperCase() + language.slice(1);

      return {
        code: pre.textContent,
        language: displayLanguage,
      };
    });
  };

  // const handleVote = async (type, targetId, direction) => {
  // Add your vote logic here
  //creating vote, user votes for the first time. database entry
  const firstVote = async (type, targetId, vType, usrId) => {
    const resp = await apiFetch(`${API_BASE_URL}/votes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        user_id: usrId,
        target_id: targetId,
        target_type: type,
        vote_type: vType,
      }),
    });
    if (!resp.ok) throw new Error("cant create vote");
    const json = await resp.json();
    return { type: vType, id: json.vote.id };
  };

  //upvote <-> downvote switch
  const switchVote = async (voteId, newType) => {
    const resp = await apiFetch(`${API_BASE_URL}/votes/${voteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ vote_type: newType }),
    });
    if (!resp.ok) throw new Error("vote switch failed");
    const json = await resp.json();
    return { type: newType, id: json.vote.id };
  };

  // Delete a vote
  const deleteVote = async (voteId) => {
    const resp = await apiFetch(`${API_BASE_URL}/votes/${voteId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!resp.ok) throw new Error("vote delete failed");
  };

  const handleVote = async (type, targetId, dir) => {
    if (voteInProgress) return;

    const uStr = localStorage.getItem("user");
    if (!uStr) {
      alert("Please log in to vote");
      return;
    }
    const usr = JSON.parse(uStr);
    if (!usr.id) {
      alert("Please log in to vote");
      return;
    }

    const existing = type === "question" ? quesVote : ansVotes[targetId];
    const currentType = existing?.type || null;
    const newType = dir === "up" ? "upvote" : "downvote";

    setVoteInProgress(true);
    try {
      let diff = 0;
      let repDiff = 0;

      // If clicking the same button again, remove the vote
      if (currentType === newType) {
        await deleteVote(existing.id);
        diff = currentType === "upvote" ? -1 : 1;
        repDiff = currentType === "upvote" ? -10 : 10;

        if (type === "question") {
          setquesVote(null);
        } else {
          setAnsVotes((prev) => {
            const updated = { ...prev };
            delete updated[targetId];
            return updated;
          });
        }
      } else {
        // Create, switch, or update vote
        let vote;
        if (!existing) {
          vote = await firstVote(type, targetId, newType, usr.id);
          if (newType === "upvote") {
            diff = 1;
            repDiff = 10;
          } else {
            diff = -1;
            repDiff = -10;
          }
        } else {
          vote = await switchVote(existing.id, newType);
          if (currentType === "upvote" && newType === "downvote") {
            diff = -2;
            repDiff = -20;
          } else if (currentType === "downvote" && newType === "upvote") {
            diff = 2;
            repDiff = 20;
          }
        }

        if (type === "question") {
          setquesVote(vote);
        } else {
          setAnsVotes((prev) => ({ ...prev, [targetId]: vote }));
        }
      }

      // Update question/answer vote count
      setQuestion((prev) => ({
        ...prev,
        ...(type === "question"
          ? { voteCount: (prev.voteCount || 0) + diff }
          : {
              answers: prev.answers.map((a) =>
                a.id === targetId
                  ? { ...a, upvotes: (a.upvotes || 0) + diff }
                  : a
              ),
            }),
      }));

      // Update author's reputation
      const userId =
        type === "question"
          ? question.user_id
          : question.answers.find((a) => a.id === targetId)?.user_id;

      if (userId) {
        setUsers((prev) => ({
          ...prev,
          [userId]: {
            ...prev[userId],
            reputation: (prev[userId]?.reputation || 0) + repDiff,
          },
        }));
      }
    } catch (e) {
      alert("Vote failed");
    } finally {
      setVoteInProgress(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleScrollToAnswer = () => {
    if (ansForm.current) {
      ansForm.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!isAnsLengVal()) {
      setAnsErr("Answer must be at least 20 characters long.");
      return;
    }

    setIsSubmitAns(true);
    setAnsErr("");

    localStorage.removeItem(draftKey); // Clear draft after posting
    setAnsContent("");

    try {
      const token = localStorage.getItem("token");

      // Apply stored languages to each code block
      let contentWithLanguage = ansContent;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = ansContent;
      const preElements = tempDiv.querySelectorAll("pre.ql-syntax");

      preElements.forEach((pre, index) => {
        // Use the stored language for this block index
        const language = codeBlockLanguages.current[index] || selectedLanguage;
        pre.setAttribute("data-language", language);
      });
      contentWithLanguage = tempDiv.innerHTML;
      const response = await apiFetch(
        `${API_BASE_URL}/answers/questions/${id}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: contentWithLanguage }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAnsErr(data.message || "Failed to post answer");
        return;
      }

      // Success - reset form and reload answers
      setAnsContent("");
      setAnsSuccess("Answer posted successfully!");
      await fetchAnswers();

      // Fetch updated user data to get new answer count
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );

      // Use the user_id from the answer response
      const userId = data.answer.user_id;
      if (userId) {
        try {
          const userResponse = await apiFetch(
            `${API_BASE_URL}/users/${userId}`
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
          }
        } catch (error) {
          // Handle error silently
        }
      }

      // Clear success message after 3 seconds
      setTimeout(() => setAnsSuccess(""), 3000);
    } catch (error) {
      setAnsErr("Error posting answer: " + error.message);
    } finally {
      setIsSubmitAns(false);
    }
  };

  const handleStartEditAnswer = (answer) => {
    /**
     * AC 1: Enter edit mode for an answer
     * Pre-fills editor with existing content
     */
    setEditingAnswerId(answer.id);
    setEditAnswerContent(answer.content);
    setEditAnswerReason("");
    setEditError("");

    // Scroll to the answer being edited
    setTimeout(() => {
      const answerElement = document.getElementById(`answer-${answer.id}`);
      if (answerElement) {
        answerElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleCancelEditAnswer = () => {
    /**
     * AC 1: Cancel editing
     */
    if (editAnswerContent !== "") {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirm) return;
    }

    setEditingAnswerId(null);
    setEditAnswerContent("");
    setEditAnswerReason("");
    setEditError("");
  };

  const handleSubmitEditAnswer = async (answerId) => {
    /**
     * AC 1: Save answer edits
     */
    // Validate minimum length
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editAnswerContent;
    const plainText = (tempDiv.textContent || "").trim();

    if (plainText.length < 20) {
      setEditError("Answer must be at least 20 characters long.");
      return;
    }

    setIsSubmittingEdit(true);
    setEditError("");

    try {
      const token = localStorage.getItem("token");

      // Apply language tags to code blocks (similar to answer submission)
      let contentWithLanguage = editAnswerContent;
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = editAnswerContent;
      const preElements = tempDiv.querySelectorAll("pre.ql-syntax");

      preElements.forEach((pre, index) => {
        const language = codeBlockLanguages.current[index] || selectedLanguage;
        pre.setAttribute("data-language", language);
      });
      contentWithLanguage = tempDiv.innerHTML;

      const response = await fetch(`${API_BASE_URL}/answers/${answerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          body: contentWithLanguage,
          edit_reason: editAnswerReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEditError(data.error || data.message || "Failed to update answer");
        return;
      }

      // Success - reload answers to show updated content
      await fetchAnswers();

      // Exit edit mode
      setEditingAnswerId(null);
      setEditAnswerContent("");
      setEditAnswerReason("");

      // Show success message
      alert("Answer updated successfully!");

      // AC 2: Show notification if acceptance was removed
      if (data.acceptance_removed) {
        alert(
          "Note: Your answer was previously accepted. The acceptance has been temporarily removed until the question author reviews your changes."
        );
      }
    } catch (error) {
      setEditError("Error updating answer: " + error.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="question-detail-loading">
        <div className="spinner"></div>
        <p>Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="question-detail-not-found">
        <h2>Question not found</h2>
        <p>
          The question you're looking for doesn't exist or may have been
          removed.
        </p>
      </div>
    );
  }

  const questionAuthor = getUserInfo(question.user_id);
  const codeBlocks = extractCodeFromHTML(question.body);

  return (
    <div className="question-detail-page">
      <div className="question-detail-layout">
        {/* Main Content Container */}
        <div className="question-main-container">
          <div className="question-content-card">
            {/* Home Button */}
            <div className="home-button-container">
              <button className="home-button" onClick={() => navigate("/")}>
                ← Back to Home
              </button>
            </div>
            {/* Question Header Section */}
            <div className="question-header-section">
              <div className="question-vote-container">
                <button
                  className={`vote-button vote-button--up ${
                    quesVote?.type === "upvote" ? "active" : ""
                  }`}
                  onClick={() => handleVote("question", question.id, "up")}
                  disabled={voteInProgress}
                >
                  ▲
                </button>
                <span className="vote-count">{question.voteCount || 0}</span>
                <button
                  className={`vote-button vote-button--down ${
                    quesVote?.type === "downvote" ? "active" : ""
                  }`}
                  onClick={() => handleVote("question", question.id, "down")}
                  disabled={voteInProgress}
                >
                  ▼
                </button>
              </div>

              {/* <div className="question-header-content">
                <div className="question-title-container">
                  <h1 className="question-title">{question.title}</h1>
                </div> */}

              <div className="question-header-content">
                {/* Question Header with Edit Button */}
                <div
                  className="question-header-actions"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h1 className="question-title">
                      {question.title.charAt(0).toUpperCase() +
                        question.title.slice(1)}
                    </h1>

                    {/* Edit Indicator (AC 8) */}
                    {question.edit_count > 0 && (
                      <div
                        className="edit-indicator"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          fontSize: "14px",
                          color: "#6b7280",
                          marginTop: "8px",
                          cursor: "pointer",
                        }}
                        title={`Last edited ${
                          question.updated_at
                            ? new Date(question.updated_at).toLocaleString()
                            : "recently"
                        }`}
                        onClick={() => navigate(`/questions/${id}/history`)}
                      >
                        <span style={{ marginRight: "4px" }}>✏️</span>
                        <span>(edited)</span>
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      onClick={handleEditClick}
                      className="action-button action-button--secondary"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit Question
                    </button>
                  )}
                </div>

                <div className="question-meta-container">
                  <div className="meta-info">
                    <span>Asked {formatDate(question.created_at)}</span>
                    <span className="meta-divider">•</span>
                    <span>Viewed {question.view_count || 0} times</span>
                    <span className="meta-divider">•</span>
                    <span
                      className={`status-badge status-badge--${question.status}`}
                    >
                      {question.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="question-tags-container">
                  <div className="tags-list">
                    {question.tags &&
                      question.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="tag-badge tag-badge--clickable"
                        >
                          {tag.tag_name}
                        </span>
                      ))}
                    {question.courseCode && (
                      <span className="course-badge">
                        {question.courseCode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="status-indicators-container">
                  {question.isAnswered && (
                    <span className="status-badge status-badge--answered">
                      ✓ Answered
                    </span>
                  )}
                  {question.hasAcceptedAnswer && (
                    <span className="status-badge status-badge--accepted">
                      ✓ Accepted
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Question Body Section */}
            <div className="question-body-section">
              <div className="question-content-container">
                <div
                  className="question-description"
                  dangerouslySetInnerHTML={{
                    __html: capitalizeFirstLetter(question.body),
                  }}
                />

                {/* Code Blocks Container */}
                <div className="code-blocks-container">
                  {codeBlocks.map((block, index) => (
                    <div key={index} className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-language">{block.language}</span>
                        <button
                          className="code-copy-button"
                          onClick={() => handleCopyCode(block.code, index)}
                        >
                          {copiedCodeId === index ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language={block.language.toLowerCase()}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: "0 0 8px 8px",
                          fontSize: "14px",
                        }}
                      >
                        {block.code}
                      </SyntaxHighlighter>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Question Actions Section */}
            <div className="question-actions-section">
              <div className="actions-container">
                <div className="actions-stats">
                  <span className="action-stat">
                    {question.answerCount || 0} answers
                  </span>
                  <span className="action-stat">
                    {question.commentCount || 0} comments
                  </span>
                </div>

                <div className="actions-buttons">
                  <div className="no-answers-container">
                    <div className="no-answers-content">
                      <button
                        className="action-button action-button--primary"
                        onClick={handleScrollToAnswer}
                      >
                        Answer Question
                      </button>
                    </div>
                  </div>
                  <button className="action-button" onClick={handleShare}>
                    Share
                  </button>
                  {question.user_id === "current_user_id" && (
                    <div className="owner-actions">
                      <button className="action-button action-button--edit">
                        Edit
                      </button>
                      <button className="action-button action-button--danger">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/*answer given by ai*/}
            <AiAnsSec
              questionId={question.id}
              questionTitle={question.title}
              questionBody={question.body}
            />

            {/*summary provided by ai*/}
            {question?.answers?.length >= 2 && (
              <AiSummariseSec ans={question.answers} />
            )}

            {/* Answers Section */}

            <div className="answers-section">
              <div className="answers-header-container">
                <h2 className="answers-title">
                  {question.answers ? question.answers.length : 0} Answer
                  {question.answers?.length !== 1 ? "s" : ""}
                </h2>
              </div>

              <div className="answers-list">
                {question.answers && question.answers.length > 0 ? (
                  question.answers.map((answer, index) => {
                    const answerAuthor = getUserInfo(answer.user_id);
                    const answerCodeBlocks = extractCodeFromHTML(
                      answer.content
                    );
                    const isEditing = editingAnswerId === answer.id;
                    const currentUser = JSON.parse(
                      localStorage.getItem("user") || "{}"
                    );
                    const canEdit =
                      answer.can_edit || currentUser.id === answer.user_id;

                    return (
                      <div
                        key={index}
                        id={`answer-${answer.id}`}
                        className={`answer-card ${
                          answer.is_accepted ? "answer-card--accepted" : ""
                        }`}
                      >
                        {answer.is_accepted && (
                          <div className="answer-accepted-badge">
                            ✓ Accepted Answer
                          </div>
                        )}

                        <div className="answer-content-container">
                          <div className="answer-vote-container">
                            <button
                              className={`vote-button vote-button--up ${
                                ansVotes[answer.id]?.type === "upvote"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleVote("answer", answer.id, "up")
                              }
                            >
                              ▲
                            </button>
                            <span className="vote-count">
                              {answer.upvotes || 0}
                            </span>
                            <button
                              className={`vote-button vote-button--down ${
                                ansVotes[answer.id]?.type === "downvote"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleVote("answer", answer.id, "down")
                              }
                            >
                              ▼
                            </button>
                          </div>

                          <div className="answer-body-container">
                            {!isEditing ? (
                              <>
                                {/* Normal view mode */}
                                <div
                                  className="answer-content"
                                  dangerouslySetInnerHTML={{
                                    __html: capitalizeFirstLetter(
                                      answer.content
                                    ),
                                  }}
                                />

                                {/* Answer Code Blocks */}
                                <div className="answer-code-blocks">
                                  {answerCodeBlocks.map((block, codeIndex) => (
                                    <div
                                      key={codeIndex}
                                      className="code-block-wrapper"
                                    >
                                      <div className="code-block-header">
                                        <span className="code-language">
                                          {block.language}
                                        </span>
                                        <button
                                          className="code-copy-button"
                                          onClick={() =>
                                            handleCopyCode(
                                              block.code,
                                              `answer-${index}-${codeIndex}`
                                            )
                                          }
                                        >
                                          {copiedCodeId ===
                                          `answer-${index}-${codeIndex}`
                                            ? "Copied!"
                                            : "Copy"}
                                        </button>
                                      </div>
                                      <SyntaxHighlighter
                                        language={block.language.toLowerCase()}
                                        style={vscDarkPlus}
                                        customStyle={{
                                          margin: 0,
                                          borderRadius: "0 0 8px 8px",
                                          fontSize: "14px",
                                        }}
                                      >
                                        {block.code}
                                      </SyntaxHighlighter>
                                    </div>
                                  ))}
                                </div>

                                {/* AC 1: Edit indicator with tooltip */}
                                {answer.is_edited && (
                                  <div
                                    className="edit-indicator"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      fontSize: "12px",
                                      color: "#6b7280",
                                      marginTop: "8px",
                                      cursor: "pointer",
                                    }}
                                    title={`Last edited ${
                                      answer.updated_at
                                        ? new Date(
                                            answer.updated_at
                                          ).toLocaleString()
                                        : "recently"
                                    }`}
                                  >
                                    <span style={{ marginRight: "4px" }}>
                                      ✏️
                                    </span>
                                    <span>
                                      (edited {answer.edit_count}{" "}
                                      {answer.edit_count === 1
                                        ? "time"
                                        : "times"}
                                      )
                                    </span>
                                  </div>
                                )}

                                <div className="answer-footer-container">
                                  <div className="answer-meta">
                                    <div className="answer-author">
                                      <span className="answer-author-name">
                                        Answered by {answerAuthor.username}
                                      </span>
                                    </div>
                                    <span className="answer-time">
                                      {formatDate(answer.created_at)}
                                    </span>
                                  </div>
                                  <div className="answer-actions">
                                    {/* AC 1: Edit button - only visible to author */}
                                    {canEdit && (
                                      <button
                                        className="action-button"
                                        onClick={() =>
                                          handleStartEditAnswer(answer)
                                        }
                                      >
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Edit mode */}
                                <div className="answer-edit-form">
                                  <h4>Edit your answer</h4>

                                  {editError && (
                                    <div className="ans-inp-err">
                                      {editError}
                                    </div>
                                  )}

                                  <div className="code-language-selector">
                                    <label htmlFor="edit-code-lang">
                                      Code Language:{" "}
                                    </label>
                                    <select
                                      id="edit-code-lang"
                                      value={selectedLanguage}
                                      onChange={(e) =>
                                        setSelectedLanguage(e.target.value)
                                      }
                                    >
                                      <option value="javascript">
                                        JavaScript
                                      </option>
                                      <option value="python">Python</option>
                                      <option value="java">Java</option>
                                      <option value="cpp">C++</option>
                                      <option value="csharp">C#</option>
                                      <option value="typescript">
                                        TypeScript
                                      </option>
                                      <option value="php">PHP</option>
                                      <option value="ruby">Ruby</option>
                                      <option value="go">Go</option>
                                      <option value="rust">Rust</option>
                                      <option value="sql">SQL</option>
                                    </select>
                                  </div>

                                  <ReactQuill
                                    ref={editQuillRef}
                                    value={editAnswerContent}
                                    onChange={setEditAnswerContent}
                                    placeholder="Edit your answer (minimum 20 characters)"
                                    modules={{
                                      toolbar: [
                                        [{ header: [1, 2, 3, false] }],
                                        [
                                          "bold",
                                          "italic",
                                          "underline",
                                          "strike",
                                        ],
                                        [
                                          { list: "ordered" },
                                          { list: "bullet" },
                                        ],
                                        ["link", "code-block"],
                                        ["clean"],
                                      ],
                                    }}
                                    className="ans-edit"
                                  />

                                  <div style={{ marginTop: "12px" }}>
                                    <label
                                      htmlFor="edit-reason"
                                      style={{
                                        display: "block",
                                        marginBottom: "4px",
                                        fontSize: "14px",
                                      }}
                                    >
                                      Edit reason (optional):
                                    </label>
                                    <input
                                      id="edit-reason"
                                      type="text"
                                      value={editAnswerReason}
                                      onChange={(e) =>
                                        setEditAnswerReason(e.target.value)
                                      }
                                      placeholder="Why are you editing this answer?"
                                      style={{
                                        width: "100%",
                                        padding: "8px",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        fontSize: "14px",
                                      }}
                                      maxLength={200}
                                    />
                                  </div>

                                  <div
                                    className="answer-edit-actions"
                                    style={{
                                      marginTop: "16px",
                                      display: "flex",
                                      gap: "8px",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handleSubmitEditAnswer(answer.id)
                                      }
                                      className="action-button action-button--primary"
                                      disabled={isSubmittingEdit}
                                    >
                                      {isSubmittingEdit
                                        ? "Saving..."
                                        : "Save Changes"}
                                    </button>
                                    <button
                                      onClick={handleCancelEditAnswer}
                                      className="action-button"
                                      disabled={isSubmittingEdit}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-answers-container">
                    <div className="no-answers-content">
                      <p>
                        No answers yet. Be the first to answer this question!
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <form
                className="user-ans-input"
                ref={ansForm}
                onSubmit={handleSubmitAnswer}
              >
                <h3 className="ans-inp-title">Add your answer</h3>

                {ansErr && <div className="ans-inp-err">{ansErr}</div>}
                {ansSuccess && (
                  <div className="ans-inp-success">{ansSuccess}</div>
                )}

                <div className="ans-inp-content">
                  <div className="code-language-selector">
                    <label htmlFor="code-lang">Code Language: </label>
                    <select
                      id="code-lang"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                      <option value="typescript">TypeScript</option>
                      <option value="php">PHP</option>
                      <option value="ruby">Ruby</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="swift">Swift</option>
                      <option value="kotlin">Kotlin</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="sql">SQL</option>
                      <option value="bash">Bash</option>
                      <option value="r">R</option>
                      <option value="matlab">MATLAB</option>
                      <option value="plaintext">Plain Text</option>
                    </select>
                  </div>

                  <ReactQuill
                    ref={quillRef}
                    value={ansContent}
                    // onChange={handleContentChange}
                    onChange={(content) => {
                      setAnsContent(content);
                      localStorage.setItem(draftKey, content);
                      if (ansErr) setAnsErr("");
                      if (ansSuccess) setAnsSuccess("");
                    }}
                    placeholder="Answer here pls![atleast 20 characters]"
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "code-block"],
                        ["clean"],
                      ],
                    }}
                    className="ans-edit"
                  />
                </div>

                <div className="ans-inp-actions">
                  <button
                    type="submit"
                    className="action-button action-button--primary"
                    disabled={!isAnsLengVal()}
                  >
                    {isSubmitAns ? "Posting..." : "Post Answer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Sidebar Container */}
        <div className="question-sidebar-container">
          {/* Author Card */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Asked by</h3>
            </div>
            <div className="card-content">
              <div className="author-profile">
                <div className="author-avatar-container">
                  {questionAuthor.profile_picture_url ? (
                    <img
                      src={
                        questionAuthor.id ===
                        JSON.parse(localStorage.getItem("user") || "{}").id
                          ? JSON.parse(localStorage.getItem("user") || "{}")
                              .profile_picture_url
                          : questionAuthor.profile_picture_url
                      }
                      alt={questionAuthor.username}
                      className="author-avatar"
                    />
                  ) : (
                    <div className="author-avatar-placeholder">
                      {questionAuthor.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="author-details-container">
                  <div className="author-name-container">
                    <a
                      href={`/questions/${question.id}`}
                      className="author-name"
                    >
                      {questionAuthor.username}
                    </a>
                    <div className="verification-badges"></div>
                  </div>
                  <div className="author-reputation-container">
                    <span className="reputation-icon">⭐</span>
                    <span className="reputation-value">
                      {questionAuthor.reputation || 0} reputation
                    </span>
                  </div>
                  <div className="author-join-date">
                    Member since{" "}
                    {questionAuthor.join_date
                      ? formatDate(questionAuthor.join_date)
                      : "recently"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Question Stats</h3>
            </div>
            <div className="card-content">
              <div className="stats-container">
                <div className="stat-row">
                  <span className="stat-label">Views:</span>
                  <span className="stat-value">{question.view_count || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Answers:</span>
                  <span className="stat-value">
                    {question.answers?.length || 0}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Votes:</span>
                  <span className="stat-value">{question.voteCount || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Asked:</span>
                  <span className="stat-value">
                    {formatDate(question.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Questions Card */}
          <div className="sidebar-card">
            <div className="card-header">
              <h3 className="card-title">Related Questions</h3>
            </div>
            <div className="card-content">
              <div className="related-questions-container">
                {relatedQuestions.length > 0 ? (
                  relatedQuestions.map((relatedQ) => (
                    <div key={relatedQ.id} className="related-question">
                      <a
                        href={`/questions/${relatedQ.id}`}
                        className="related-question-link"
                      >
                        {relatedQ.title}
                      </a>
                      <div className="related-question-meta">
                        <span>{relatedQ.answerCount || 0} answers</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="related-question">
                    <p className="no-related">No related questions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicQuestionDetail;
