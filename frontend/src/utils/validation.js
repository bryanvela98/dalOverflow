/**
 * Validation utility functions for Dal Overflow
 * Extracted from existing component validation logic
 */

/**
 * Validates if email ends with @dal.ca domain
 * Source: UserRegistration.jsx line 14
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid Dal email
 */
export const validateDalEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return email.endsWith('@dal.ca');
};

/**
 * Validates password strength
 * Source: UserRegistration.jsx line 19-20
 * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates question title length
 * Source: CreateQuestionPage.jsx line 96-99
 * @param {string} title - Question title
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validateQuestionTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Title is required' };
  }
  
  const trimmed = title.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Title is required' };
  }
  
  if (trimmed.length < 15) {
    return { isValid: false, error: 'Title must be at least 15 characters' };
  }
  
  if (trimmed.length > 150) {
    return { isValid: false, error: 'Title must not exceed 150 characters' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates question description
 * Source: CreateQuestionPage.jsx line 102-105
 * Note: Rich text editor may produce <p><br></p> for empty content
 * @param {string} description - Question description (may contain HTML)
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validateQuestionDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { isValid: false, error: 'Description is required' };
  }
  
  const trimmed = description.trim();
  
  if (!trimmed || trimmed === '<p><br></p>') {
    return { isValid: false, error: 'Description is required' };
  }
  
  if (trimmed.length < 30) {
    return { isValid: false, error: 'Description must be at least 30 characters' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validates tag selection count
 * Source: CreateQuestionPage.jsx line 108-111
 * @param {Array} tags - Array of selected tags
 * @returns {object} { isValid: boolean, error: string|null }
 */
export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    return { isValid: false, error: 'Tags must be an array' };
  }
  
  if (tags.length === 0) {
    return { isValid: false, error: 'Please select at least one tag' };
  }
  
  if (tags.length > 5) {
    return { isValid: false, error: 'Maximum 5 tags allowed' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Get detailed password validation errors
 * Helper to provide specific error messages for password requirements
 * @param {string} password - Password to validate
 * @returns {string[]} Array of error messages
 */
export const getPasswordErrors = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('Password must contain at least one symbol (@$!%*?&#)');
  }
  
  return errors;
};

/**
 * Validate complete question form
 * Source: CreateQuestionPage.jsx line 91-116
 * @param {object} formData - { title, description, tags }
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateQuestionForm = (formData) => {
  const { title, description, tags } = formData;
  const errors = {};
  
  const titleValidation = validateQuestionTitle(title);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }
  
  const descriptionValidation = validateQuestionDescription(description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error;
  }
  
  const tagsValidation = validateTags(tags);
  if (!tagsValidation.isValid) {
    errors.tags = tagsValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};