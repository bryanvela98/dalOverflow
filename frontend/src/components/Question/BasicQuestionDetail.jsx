import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "react-quill/dist/quill.snow.css";
import "./BasicQuestionDetail.css";

const BasicQuestionDetail = () => {
  const { id } = useParams();
  const draftKey = `draftAnswer_${id}`;
  const [question, setQuestion] = useState(null);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
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
      const answersResponse = await fetch(
        `http://localhost:5001/api/answers/questions/${id}/answers`
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
      console.error("Error fetching answers:", error);
      return [];
    }
  };

  const fetchRelatedQuestions = async (currentQuestionId, tags) => {
    try {
      const response = await fetch("http://localhost:5001/api/questions");
      const data = await response.json();
      const questions = data.questions || [];

      console.log("Current question tags:", tags);
      console.log("Sample question tags:", questions[0]?.tags);

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
          console.log(
            `Question ${q.id} has common tag: ${hasCommonTag}`,
            qTags
          );
          return hasCommonTag;
        })
        .slice(0, 3); // Get top 3 related questions

      console.log("Related questions found:", related);
      setRelatedQuestions(related);
    } catch (error) {
      console.error("Error fetching related questions:", error);
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
        const response = await fetch(
          `http://localhost:5001/api/questions/${id}`
        );
        const data = await response.json();
        console.log("Question data:", data);

        if (isMounted) {
          if (!data.question) {
            setLoading(false);
            return;
          }

          const answersResponse = await fetch(
            `http://localhost:5001/api/answers/questions/${id}/answers`
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
          await fetchUserData(data.question, answers);

          // Fetch related questions based on tags
          if (data.question.tags && data.question.tags.length > 0) {
            fetchRelatedQuestions(data.question.id, data.question.tags);
          }
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchUserData = async (questionData, answers = []) => {
      if (!isMounted) return;

      const usersMap = {};

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
          const response = await fetch(
            `http://localhost:5001/api/users/${userId}`
          );
          if (response.ok) {
            const userData = await response.json();
            usersMap[userId] = userData?.user || {
              username: `User ${userId}`,
              reputation: 0,
            };

            // Log answer count for logged in user
            const currentUser = JSON.parse(
              localStorage.getItem("currentUser") || "{}"
            );
            console.log("Current user from localStorage:", currentUser);
            console.log("Fetched user data:", userData);
            console.log("User ID being checked:", userId);

            if (
              currentUser.id === userId &&
              userData?.user?.answer_count !== undefined
            ) {
              console.log(
                `Answer count for logged in user (${userData.user.username}):`,
                userData.user.answer_count
              );
            } else if (userData?.user?.answer_count !== undefined) {
              console.log(
                `Answer count for user ${userId} (${userData.user.username}):`,
                userData.user.answer_count
              );
            }
          } else {
            usersMap[userId] = {
              username: `User ${userId}`,
              reputation: 0,
            };
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
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


  const getAnsInpLen = (html) => {
    if (!html) return 0;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || "").trim().length;
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

  const handleVote = async (type, targetId, direction) => {
    console.log(`Vote ${direction} on ${type} ${targetId}`);
    // Add your vote logic here
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
      const response = await fetch(
        `http://localhost:5001/api/answers/questions/${id}/answers`,
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
      console.log("Response status:", response.status);
      console.log("Response data:", data);

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
      console.log("Current user for answer count update:", currentUser);
      console.log("User ID from posted answer:", data.answer.user_id);

      // Use the user_id from the answer response
      const userId = data.answer.user_id;
      if (userId) {
        try {
          const userResponse = await fetch(
            `http://localhost:5001/api/users/${userId}`
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log(
              "Answer Posted!Updated answer count for logged in user:",
              userData.user.answer_count
            );
          } else {
            console.log(
              "Failed to fetch user data, status:",
              userResponse.status
            );
          }
        } catch (error) {
          console.error("Error fetching updated user data:", error);
        }
      } else {
        console.log("No user ID found to fetch answer count");
      }

      // Clear success message after 3 seconds
      setTimeout(() => setAnsSuccess(""), 3000);
    } catch (error) {
      console.error("Fetch error:", error);
      setAnsErr("Error posting answer: " + error.message);
    } finally {
      setIsSubmitAns(false);
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
            {/* Question Header Section */}
            <div className="question-header-section">
              <div className="question-vote-container">
                <button
                  className="vote-button vote-button--up"
                  onClick={() => handleVote("question", question.id, "up")}
                >
                  ▲
                </button>
                <span className="vote-count">{question.voteCount || 0}</span>
                <button
                  className="vote-button vote-button--down"
                  onClick={() => handleVote("question", question.id, "down")}
                >
                  ▼
                </button>
              </div>

              <div className="question-header-content">
                <div className="question-title-container">
                  <h1 className="question-title">{question.title}</h1>
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
                  dangerouslySetInnerHTML={{ __html: question.body }}
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

                    return (
                      <div
                        key={index}
                        className={`answer-card ${
                          answer.isAccepted ? "answer-card--accepted" : ""
                        }`}
                      >
                        {answer.isAccepted && (
                          <div className="answer-accepted-badge">
                            ✓ Accepted Answer
                          </div>
                        )}

                        <div className="answer-content-container">
                          <div className="answer-vote-container">
                            <button
                              className="vote-button vote-button--up"
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
                              className="vote-button vote-button--down"
                              onClick={() =>
                                handleVote("answer", answer.id, "down")
                              }
                            >
                              ▼
                            </button>
                          </div>

                          <div className="answer-body-container">
                            <div
                              className="answer-content"
                              dangerouslySetInnerHTML={{
                                __html: answer.content,
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
                                <button className="action-button">Share</button>
                                <button className="action-button">
                                  Report
                                </button>
                              </div>
                            </div>
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
