import { describe, it, expect } from 'vitest';
import {
  validateDalEmail,
  validatePassword,
  validateQuestionTitle,
  validateQuestionDescription,
  validateTags,
  getPasswordErrors,
  validateQuestionForm
} from './validation';

describe('validateDalEmail', () => {
  it('should return true for valid @dal.ca emails', () => {
    expect(validateDalEmail('student@dal.ca')).toBe(true);
    expect(validateDalEmail('john.doe@dal.ca')).toBe(true);
    expect(validateDalEmail('test123@dal.ca')).toBe(true);
  });

  it('should return false for non-Dal emails', () => {
    expect(validateDalEmail('student@gmail.com')).toBe(false);
    expect(validateDalEmail('user@dalhousie.ca')).toBe(false);
    expect(validateDalEmail('test@example.com')).toBe(false);
  });

  it('should return false for invalid inputs', () => {
    expect(validateDalEmail('')).toBe(false);
    expect(validateDalEmail(null)).toBe(false);
    expect(validateDalEmail(undefined)).toBe(false);
    expect(validateDalEmail(123)).toBe(false);
  });

  it('should be case-sensitive for domain', () => {
    expect(validateDalEmail('test@DAL.CA')).toBe(false);
    expect(validateDalEmail('test@dal.CA')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should return true for valid passwords', () => {
    expect(validatePassword('Test1234!')).toBe(true);
    expect(validatePassword('MySecure@Pass1')).toBe(true);
    expect(validatePassword('ValidP@ss123')).toBe(true);
  });

  it('should return false for passwords missing requirements', () => {
    expect(validatePassword('password123!')).toBe(false); // No uppercase
    expect(validatePassword('PASSWORD123!')).toBe(false); // No lowercase
    expect(validatePassword('Password!')).toBe(false); // No digit
    expect(validatePassword('Password123')).toBe(false); // No symbol
    expect(validatePassword('Pass1!')).toBe(false); // Too short
  });

  it('should accept all required special characters', () => {
    expect(validatePassword('Test123@')).toBe(true);
    expect(validatePassword('Test123$')).toBe(true);
    expect(validatePassword('Test123!')).toBe(true);
    expect(validatePassword('Test123%')).toBe(true);
    expect(validatePassword('Test123*')).toBe(true);
    expect(validatePassword('Test123?')).toBe(true);
    expect(validatePassword('Test123&')).toBe(true);
    expect(validatePassword('Test123#')).toBe(true);
  });

  it('should return false for invalid inputs', () => {
    expect(validatePassword('')).toBe(false);
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword(undefined)).toBe(false);
  });
});

describe('validateQuestionTitle', () => {
  it('should return valid for correct title lengths', () => {
    const result = validateQuestionTitle('This is a valid question title');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should accept exactly 15 characters', () => {
    const title = 'a'.repeat(15);
    const result = validateQuestionTitle(title);
    expect(result.isValid).toBe(true);
  });

  it('should accept exactly 150 characters', () => {
    const title = 'a'.repeat(150);
    const result = validateQuestionTitle(title);
    expect(result.isValid).toBe(true);
  });

  it('should reject titles that are too short', () => {
    const result = validateQuestionTitle('Too short');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Title must be at least 15 characters');
  });

  it('should reject titles that are too long', () => {
    const longTitle = 'a'.repeat(151);
    const result = validateQuestionTitle(longTitle);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Title must not exceed 150 characters');
  });

  it('should reject empty or whitespace-only titles', () => {
    expect(validateQuestionTitle('').isValid).toBe(false);
    expect(validateQuestionTitle('   ').isValid).toBe(false);
    expect(validateQuestionTitle('').error).toBe('Title is required');
  });

  it('should handle null/undefined inputs', () => {
    expect(validateQuestionTitle(null).isValid).toBe(false);
    expect(validateQuestionTitle(undefined).isValid).toBe(false);
  });

  it('should trim whitespace before validating', () => {
    const title = '   ' + 'a'.repeat(15) + '   ';
    const result = validateQuestionTitle(title);
    expect(result.isValid).toBe(true);
  });
});

describe('validateQuestionDescription', () => {
  it('should return valid for correct descriptions', () => {
    const description = 'This is a detailed question description with more than 30 characters.';
    const result = validateQuestionDescription(description);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should accept exactly 30 characters', () => {
    const description = 'a'.repeat(30);
    const result = validateQuestionDescription(description);
    expect(result.isValid).toBe(true);
  });

  it('should reject descriptions that are too short', () => {
    const result = validateQuestionDescription('Too short');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Description must be at least 30 characters');
  });

  it('should reject empty descriptions', () => {
    const result = validateQuestionDescription('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Description is required');
  });

  it('should reject React Quill empty content', () => {
    const result = validateQuestionDescription('<p><br></p>');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Description is required');
  });

  it('should handle null/undefined inputs', () => {
    expect(validateQuestionDescription(null).isValid).toBe(false);
    expect(validateQuestionDescription(undefined).isValid).toBe(false);
  });

  it('should accept HTML content with sufficient length', () => {
    const html = '<p>This is a question with <strong>HTML tags</strong> and enough content.</p>';
    const result = validateQuestionDescription(html);
    expect(result.isValid).toBe(true);
  });
});

describe('validateTags', () => {
  it('should return valid for 1-5 tags', () => {
    expect(validateTags([{ id: 1 }]).isValid).toBe(true);
    expect(validateTags([{ id: 1 }, { id: 2 }]).isValid).toBe(true);
    expect(validateTags([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]).isValid).toBe(true);
  });

  it('should reject empty tag arrays', () => {
    const result = validateTags([]);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please select at least one tag');
  });

  it('should reject more than 5 tags', () => {
    const sixTags = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
    const result = validateTags(sixTags);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Maximum 5 tags allowed');
  });

  it('should reject non-array inputs', () => {
    expect(validateTags(null).isValid).toBe(false);
    expect(validateTags(undefined).isValid).toBe(false);
    expect(validateTags('string').isValid).toBe(false);
    expect(validateTags(123).isValid).toBe(false);
  });
});

describe('getPasswordErrors', () => {
  it('should return empty array for valid passwords', () => {
    expect(getPasswordErrors('ValidPass123!')).toEqual([]);
    expect(getPasswordErrors('Test1234@')).toEqual([]);
  });

  it('should return "required" error for empty password', () => {
    const errors = getPasswordErrors('');
    expect(errors).toEqual(['Password is required']);
  });

  it('should identify missing lowercase', () => {
    const errors = getPasswordErrors('PASSWORD123!');
    expect(errors).toContain('Password must contain at least one lowercase letter');
  });

  it('should identify missing uppercase', () => {
    const errors = getPasswordErrors('password123!');
    expect(errors).toContain('Password must contain at least one uppercase letter');
  });

  it('should identify missing number', () => {
    const errors = getPasswordErrors('Password!');
    expect(errors).toContain('Password must contain at least one number');
  });

  it('should identify missing symbol', () => {
    const errors = getPasswordErrors('Password123');
    expect(errors).toContain('Password must contain at least one symbol (@$!%*?&#)');
  });

  it('should identify short password', () => {
    const errors = getPasswordErrors('Pass1!');
    expect(errors).toContain('Password must be at least 8 characters');
  });

  it('should return multiple errors for weak passwords', () => {
    const errors = getPasswordErrors('weak');
    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('Password must contain at least one uppercase letter');
    expect(errors).toContain('Password must contain at least one number');
    expect(errors).toContain('Password must contain at least one symbol (@$!%*?&#)');
  });
});

describe('validateQuestionForm', () => {
  it('should validate complete valid form', () => {
    const formData = {
      title: 'How do I implement user authentication?',
      description: 'I need help implementing JWT authentication in my React app.',
      tags: [{ id: 1 }, { id: 2 }]
    };
    
    const result = validateQuestionForm(formData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('should return all validation errors for invalid form', () => {
    const formData = {
      title: 'Short',
      description: 'Too short',
      tags: []
    };
    
    const result = validateQuestionForm(formData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('title');
    expect(result.errors).toHaveProperty('description');
    expect(result.errors).toHaveProperty('tags');
  });

  it('should return specific errors for each field', () => {
    const formData = {
      title: 'Short',
      description: 'This is a valid description with more than thirty characters for testing.',
      tags: [{ id: 1 }]
    };
    
    const result = validateQuestionForm(formData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title must be at least 15 characters');
    expect(result.errors.description).toBeUndefined();
    expect(result.errors.tags).toBeUndefined();
  });

  it('should pass with exactly minimum requirements', () => {
    const formData = {
      title: 'a'.repeat(15),
      description: 'a'.repeat(30),
      tags: [{ id: 1 }]
    };
    
    const result = validateQuestionForm(formData);
    expect(result.isValid).toBe(true);
  });

  it('should fail with exactly one character over maximum', () => {
    const formData = {
      title: 'a'.repeat(151),
      description: 'a'.repeat(30),
      tags: [{ id: 1 }]
    };
    
    const result = validateQuestionForm(formData);
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('Title must not exceed 150 characters');
  });
});
