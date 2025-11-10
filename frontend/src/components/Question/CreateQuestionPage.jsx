import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./CreateQuestionPage.css";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {} from "react-syntax-highlighter/dist/esm/styles/prism";
import { vsDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

/**
 * Create Question Page Component (Issue #2)
 * Pure JavaScript version
 * FIXED: Removed .slice(0, 10) limit on tags display
 */
const CreateQuestionPage = ({
  availableTags = [],
  userPersonalTags = [],
  onSubmit,
  onSearchSimilar,
  onCreateTag,
  currentUserId,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [showSimilar, setShowSimilar] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [code_snippet, set_CS] = useState("");
  const [lang, set_lang] = useState("javascript");

  // AC 1: Search similar questions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.trim().length > 10) {
        try {
          const similar = await onSearchSimilar(title);
          setSimilarQuestions(similar);
          setShowSimilar(similar.length > 0);
        } catch (error) {
          console.error("Failed to search similar questions:", error);
        }
      } else {
        setSimilarQuestions([]);
        setShowSimilar(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, onSearchSimilar]);

  // AC 3: Filter tags
  const filteredTags = availableTags.filter((tag) => {
    if (!tagSearchTerm) return true;
    const searchLower = tagSearchTerm.toLowerCase();
    return (
      tag.name.toLowerCase().includes(searchLower) ||
      tag.description.toLowerCase().includes(searchLower)
    );
  });

  const isTagSelected = (tagId) => {
    return selectedTags.some((t) => t.id === tagId);
  };

  const handleAddTag = (tag) => {
    if (!isTagSelected(tag.id) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tag]);
      setTagSearchTerm("");
      setShowTagDropdown(false);
    }
  };

  const handleRemoveTag = (tagId) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  // AC 4: Create new tag
  const handleCreateNewTag = async () => {
    if (!tagSearchTerm.trim()) return;

    try {
      const newTag = await onCreateTag(tagSearchTerm.trim());
      handleAddTag(newTag);
    } catch (error) {
      console.error("Failed to create tag:", error);
      setErrors({ ...errors, tags: "Failed to create new tag" });
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 15) {
      newErrors.title = "Title must be at least 15 characters";
    } else if (title.length > 150) {
      newErrors.title = "Title must not exceed 150 characters";
    }

    if (!description.trim() || description === "<p><br></p>") {
      newErrors.description = "Description is required";
    } else if (description.length < 30) {
      newErrors.description = "Description must be at least 30 characters";
    }

    if (selectedTags.length === 0) {
      newErrors.tags = "Please select at least one tag";
    } else if (selectedTags.length > 5) {
      newErrors.tags = "Maximum 5 tags allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // AC 5: Submit question
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const questionData = {
        title,
        description,
        code_snippet,
        lang,
        tags: selectedTags.map((t) => t.id),
        isAnonymous,
      };

      await onSubmit(questionData);

      setTitle("");
      setDescription("");
      set_CS("");
      set_lang("");
      setSelectedTags([]);
      setIsAnonymous(false);
      setErrors({});
    } catch (error) {
      console.error("Failed to create question:", error);
      setErrors({
        ...errors,
        submit: "Failed to create question. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image", "code-block"],
      ["clean"],
    ],
  };

  return (
    <div className="create-question-page">
      <div className="create-question-container">
        <header className="create-question-header">
          <h1>Ask a Question</h1>
        </header>

        <form className="create-question-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <label htmlFor="title" className="form-label">
              Title *
            </label>

            <input
              id="title"
              type="text"
              className={`form-input ${
                errors.title ? "form-input--error" : ""
              }`}
              placeholder="e.g., How do I implement user authentication in Node.js with Express?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors({ ...errors, title: "" });
                }
              }}
              maxLength={150}
            />

            {errors.title && <span className="form-error">{errors.title}</span>}

            <span className="char-count">{title.length}/150</span>

            {showSimilar && similarQuestions.length > 0 && (
              <div className="similar-questions">
                <div className="similar-questions-header">
                  <span className="similar-icon">💡</span>
                  <h3>Similar Questions</h3>
                  <button
                    type="button"
                    className="close-button"
                    onClick={() => setShowSimilar(false)}
                  >
                    ×
                  </button>
                </div>
                <ul className="similar-questions-list">
                  {similarQuestions.map((sq) => (
                    <li key={sq.id} className="similar-question-item">
                      <a
                        href={`/questions/${sq.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {sq.title}
                      </a>
                      <span className="similarity-score">
                        {Math.round(sq.similarity * 100)}% match
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-label-row">
              <label htmlFor="description" className="form-label">
                Description *
              </label>

              <div className="editor-tabs">
                <button
                  type="button"
                  className={`tab-button ${
                    !showPreview ? "tab-button--active" : ""
                  }`}
                  onClick={() => setShowPreview(false)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`tab-button ${
                    showPreview ? "tab-button--active" : ""
                  }`}
                  onClick={() => setShowPreview(true)}
                >
                  Preview
                </button>
              </div>
            </div>

            {!showPreview ? (
              <ReactQuill
                theme="snow"
                value={description}
                onChange={(content) => {
                  setDescription(content);
                  if (errors.description) {
                    setErrors({ ...errors, description: "" });
                  }
                }}
                modules={quillModules}
                placeholder="Describe your issue in detail..."
              />
            ) : (
              <div
                className="description-preview"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {errors.description && (
              <span className="form-error">{errors.description}</span>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="code_snippet" className="form-label">
              Enter you code snippets here
            </label>

            <select 
              className="form-select"
              value={lang}
              onChange={(e) => set_lang(e.target.value)} 
            >
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="cpp">C++</option>
            </select>

            {!showPreview?(
              <textarea
                id="code_snippet"
                className="form-textarea code-snippet"
                placeholder="please enter desired code snippets in here"
                value={code_snippet}
                onChange={(e) =>set_CS(e.target.value)}
                rows="15"
              />
            ):(
              code_snippet && (
                <SyntaxHighlighter language={lang} style={vscDarkPlus}>
                  {code_snippet}
                </SyntaxHighlighter>
              )
            )}
          </div>

          <div className="form-section">
            <label htmlFor="tags" className="form-label">
              Tags *
            </label>

            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map((tag) => (
                  <span key={tag.id} className="tag-badge">
                    {tag.name}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="tag-search-wrapper">
              <input
                id="tags"
                type="text"
                className={`form-input ${
                  errors.tags ? "form-input--error" : ""
                }`}
                placeholder="Search for tags"
                value={tagSearchTerm}
                onChange={(e) => setTagSearchTerm(e.target.value)}
                onFocus={() => setShowTagDropdown(true)}
                disabled={selectedTags.length >= 5}
              />

              {showTagDropdown && selectedTags.length < 5 && (
                <div className="tag-dropdown">
                  {filteredTags.length > 0 ? (
                    <>
                      {/* FIXED: Removed .slice(0, 10) - Now shows ALL filtered tags */}
                      {filteredTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          className={`tag-option ${
                            isTagSelected(tag.id) ? "tag-option--selected" : ""
                          }`}
                          onClick={() => handleAddTag(tag)}
                          disabled={isTagSelected(tag.id)}
                        >
                          <span className="tag-name">{tag.name}</span>
                          <span className="tag-desc">{tag.description}</span>
                          {tag.isPersonal && (
                            <span className="tag-personal-badge">Personal</span>
                          )}
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="tag-dropdown-empty">No tags found</div>
                  )}

                  {tagSearchTerm && (
                    <button
                      type="button"
                      className="tag-create-new"
                      onClick={handleCreateNewTag}
                    >
                      <span className="create-icon">+</span>
                      Create new tag "{tagSearchTerm}"
                    </button>
                  )}
                </div>
              )}
            </div>

            {errors.tags && <span className="form-error">{errors.tags}</span>}
          </div>

          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Post anonymously as "Anonymous Dalhousie Student"</span>
            </label>
          </div>

          {errors.submit && (
            <div className="form-error-box">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      </div>

      <aside className="create-question-sidebar">
        <div className="tips-card">
          <h3>Writing a good question</h3>
          <ul>
            <li>Make your title specific and descriptive</li>
            <li>Include all relevant details in the description</li>
            <li>Add code examples when applicable</li>
            <li>Choose appropriate tags</li>
            <li>Check for similar questions first</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default CreateQuestionPage;
