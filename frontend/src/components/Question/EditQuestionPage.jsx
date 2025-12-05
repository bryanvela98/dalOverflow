import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./CreateQuestionPage.css"; // Reuse the same CSS
import BackButton from "../BackButton";

/**
 * Edit Question Page Component
 * Implements AC 2-6 for question editing
 */
const EditQuestionPage = ({
  availableTags = [],
  originalQuestion,
  onSubmit,
  onCancel,
  onCreateTag,
  currentUserId,
  requiresReview = false,
  showToast,
}) => {
  const [title, setTitle] = useState(originalQuestion.title || "");
  const [description, setDescription] = useState(originalQuestion.body || "");
  const [selectedTags, setSelectedTags] = useState([]);
  const [editReason, setEditReason] = useState("");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize selected tags from original question (AC 2)
  useEffect(() => {
    if (originalQuestion.tags) {
      const mappedTags = originalQuestion.tags.map((tag) => ({
        id: tag.id,
        name: tag.tag_name || tag.name,
        description: tag.tag_description || tag.description || "",
      }));
      setSelectedTags(mappedTags);
    }
  }, [originalQuestion]);

  // Track unsaved changes for cancel confirmation (AC 6)
  useEffect(() => {
    const titleChanged = title !== originalQuestion.title;
    const descriptionChanged = description !== originalQuestion.body;

    const originalTagIds = originalQuestion.tags?.map((t) => t.id).sort() || [];
    const currentTagIds = selectedTags.map((t) => t.id).sort();
    const tagsChanged =
      JSON.stringify(originalTagIds) !== JSON.stringify(currentTagIds);

    setHasUnsavedChanges(titleChanged || descriptionChanged || tagsChanged);
  }, [title, description, selectedTags, originalQuestion]);

  // Filter tags
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

  const handleCreateNewTag = async () => {
    if (!tagSearchTerm.trim()) return;

    try {
      const newTag = await onCreateTag(tagSearchTerm.trim());
      handleAddTag(newTag);
    } catch (error) {
      setErrors({ ...errors, tags: "Failed to create new tag" });
    }
  };

  // Validation (AC 4)
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 120) {
      newErrors.title = "Title must not exceed 120 characters";
    }

    // Get text content length
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = description;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    if (!textContent.trim() || description === "<p><br></p>") {
      newErrors.description = "Description is required";
    } else if (textContent.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    if (selectedTags.length === 0) {
      newErrors.tags = "Please select at least one tag";
    } else if (selectedTags.length > 5) {
      newErrors.tags = "Maximum 5 tags allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler (AC 5)
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
        tags: selectedTags.map((t) => t.id),
      };

      await onSubmit(questionData, editReason);

      // Reset form state
      setErrors({});
      setHasUnsavedChanges(false);
    } catch (error) {
      setErrors({
        ...errors,
        submit: error.message || "Failed to update question. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel handler (AC 6)
  const handleCancelClick = () => {
    onCancel(hasUnsavedChanges);
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
          <BackButton />
          <h1>Edit Question</h1>
          <p className="subtitle">
            Update your question to provide more details or fix mistakes
          </p>
          {requiresReview && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fef3c7",
                border: "1px solid #f59e0b",
                borderRadius: "8px",
                marginTop: "12px",
              }}
            >
              <p style={{ margin: 0, color: "#92400e" }}>
                ℹ️ This edit may require review since the question was posted
                more than 10 minutes ago.
              </p>
            </div>
          )}
        </header>

        <form className="create-question-form" onSubmit={handleSubmit}>
          {/* Title Field */}
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
              maxLength={120}
            />

            {errors.title && <span className="form-error">{errors.title}</span>}

            <span className="char-count">{title.length}/120</span>
          </div>

          {/* Description Field */}
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

          {/* Tags Field */}
          <div className="form-section">
            <label htmlFor="tags" className="form-label">
              Tags * (1-5 tags)
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

          {/* Edit Reason Field */}
          <div className="form-section">
            <label htmlFor="editReason" className="form-label">
              Edit Reason (Optional)
              <span className="form-hint">
                Briefly explain what you changed
              </span>
            </label>

            <input
              id="editReason"
              type="text"
              className="form-input"
              placeholder="e.g., Fixed typo, Added code example, Clarified question"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              maxLength={200}
            />
          </div>

          {errors.submit && (
            <div className="form-error-box">{errors.submit}</div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleCancelClick}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <aside className="create-question-sidebar">
        <div className="tips-card">
          <h3>Editing Guidelines</h3>
          <ul>
            <li>Fix typos and grammar mistakes</li>
            <li>Clarify ambiguous points</li>
            <li>Add relevant code examples</li>
            <li>Update tags if needed</li>
            <li>Don't change the meaning of your question</li>
          </ul>
        </div>

        {originalQuestion.edit_count > 0 && (
          <div className="tips-card" style={{ marginTop: "16px" }}>
            <h3>Edit History</h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              This question has been edited {originalQuestion.edit_count} time
              {originalQuestion.edit_count !== 1 ? "s" : ""}.
            </p>
            <a
              href={`/questions/${originalQuestion.id}/history`}
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontSize: "14px",
              }}
            >
              View edit history →
            </a>
          </div>
        )}
      </aside>
    </div>
  );
};

export default EditQuestionPage;
