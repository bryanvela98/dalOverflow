# Frontend Form Validation Documentation

## Overview

This document describes all form field validations implemented in the Dal Overflow frontend application.

## Validation Summary

| Form | Fields | Validation Rules |
|------|--------|-----------------|
| Question Creation | Title, Description, Tags | See details below |
| User Registration | Email, Password | See details below |
| Login | Email, Password | See details below |
| Password Reset | Email, Password | See details below |

## Question Creation Form

Location: `src/components/Question/CreateQuestionPage.jsx`

### Title Field

Validation Rules:
- Required field
- Minimum length: 15 characters
- Maximum length: 150 characters
- Trim whitespace before validation

Error Messages:
- Empty: "Title is required"
- Too short: "Title must be at least 15 characters"
- Too long: "Title must not exceed 150 characters"

Implementation (lines 94-100):
```javascript
if (!title.trim()) {
  newErrors.title = "Title is required";
} else if (title.length < 15) {
  newErrors.title = "Title must be at least 15 characters";
} else if (title.length > 150) {
  newErrors.title = "Title must not exceed 150 characters";
}
```

UI Features:
- Real-time character counter (0/150)
- Error message displayed below field
- Red border on error
- Error clears on user input

### Description Field

Validation Rules:
- Required field
- Minimum length: 30 characters
- Cannot be empty Rich Text Editor content (`<p><br></p>`)
- Trim whitespace before validation

Error Messages:
- Empty: "Description is required"
- Too short: "Description must be at least 30 characters"

Implementation (lines 102-106):
```javascript
if (!description.trim() || description === "<p><br></p>") {
  newErrors.description = "Description is required";
} else if (description.length < 30) {
  newErrors.description = "Description must be at least 30 characters";
}
```

UI Features:
- Rich text editor (React Quill)
- Edit/Preview toggle
- Error message displayed below editor
- Error clears on user input

### Tags Field

Validation Rules:
- Required: At least 1 tag
- Maximum: 5 tags
- Tag search functionality
- Can create new tags

Error Messages:
- No tags: "Please select at least one tag"
- Too many: "Maximum 5 tags allowed"
- Tag creation error: "Failed to create new tag"

Implementation (lines 108-112):
```javascript
if (selectedTags.length === 0) {
  newErrors.tags = "Please select at least one tag";
} else if (selectedTags.length > 5) {
  newErrors.tags = "Maximum 5 tags allowed";
}
```

UI Features:
- Selected tags displayed as badges with remove button
- Tag search dropdown
- Disabled when 5 tags selected
- Create new tag option
- Error message displayed below field

## User Registration Form

Location: `src/components/UserRegistrationLogin/UserRegistration.jsx`

### Email Field

Validation Rules:
- Required field
- Must end with "@dal.ca"
- Standard email format

Error Messages:
- Invalid domain: "Please use a valid Dalhousie email address (@dal.ca)"

Implementation (lines 14-17):
```javascript
if (!email.endsWith("@dal.ca")) {
  setMessage("Please use a valid Dalhousie email address (@dal.ca)");
  return;
}
```

### Password Field

Validation Rules:
- Minimum length: 8 characters
- Must contain at least one lowercase letter (a-z)
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one digit (0-9)
- Must contain at least one special character (@$!%*?&#)

Error Messages:
- Invalid format: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol"

Implementation (lines 19-26):
```javascript
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
if (!passwordRegex.test(password)) {
  setMessage(
    "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  );
  return;
}
```

### OTP Field

Validation Rules:
- Required when verifying email
- Must match OTP sent to email

Error Messages:
- Backend provides specific error messages

## Login Form

Location: `src/components/UserRegistrationLogin/Login.jsx`

### Email Field

Validation Rules:
- Required field
- Standard HTML5 email validation
- No frontend domain restriction on login

### Password Field

Validation Rules:
- Required field
- No frontend validation (checked against backend)

Error Messages:
- Network error: "Network error. Please try again."
- Login failure: "Login failed: [backend message]"

## Password Reset Form

Location: `src/components/UserRegistrationLogin/Login.jsx`

### Email Field (Forgot Password)

Validation Rules:
- Required field
- Must end with "@dal.ca"

Error Messages:
- Invalid domain: "Please use a valid Dalhousie email address (@dal.ca)"

Implementation (lines 59-62):
```javascript
if (!email.endsWith("@dal.ca")) {
  setMessage("Please use a valid Dalhousie email address (@dal.ca)");
  return;
}
```

### New Password Field

Validation Rules:
- Same as registration password (8+ chars, uppercase, lowercase, digit, symbol)

Error Messages:
- Invalid format: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol"

Implementation (lines 91-98):
```javascript
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
if (!passwordRegex.test(newPassword)) {
  setMessage(
    "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
  );
  return;
}
```

## Validation Patterns Reference

### Password Regex

Pattern: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/`

Breakdown:
- `^` - Start of string
- `(?=.*[a-z])` - At least one lowercase letter
- `(?=.*[A-Z])` - At least one uppercase letter  
- `(?=.*\d)` - At least one digit
- `(?=.*[@$!%*?&#])` - At least one special character from the set
- `[A-Za-z\d@$!%*?&#]{8,}` - At least 8 characters from allowed set
- `$` - End of string

Used in:
- User registration (UserRegistration.jsx)
- Password reset (Login.jsx)

### Email Validation

Pattern: `email.endsWith("@dal.ca")`

Used in:
- User registration (UserRegistration.jsx)
- Password reset (Login.jsx)

## Error Display Patterns

### Inline Errors (Question Form)

```jsx
{errors.title && <span className="form-error">{errors.title}</span>}
```

CSS class: `.form-error`
- Red text color
- Small font size
- Displayed below field

### Input Error State

```jsx
className={`form-input ${errors.title ? "form-input--error" : ""}`}
```

CSS class: `.form-input--error`
- Red border
- Focus ring red

### Message Display (Login/Registration)

```jsx
{message && <div className="message">{message}</div>}
```

CSS class: `.message`
- Displayed at bottom of form
- Can show success or error messages

## Validation Timing

### Real-time Validation

Question Form:
- Title: Character count updates on every keystroke
- Description: Validation on blur or submit
- Tags: Immediate feedback when selecting/removing

### On-Submit Validation

All Forms:
- Final validation runs on form submission
- Prevents submission if validation fails
- Returns focus to first error field

### Error Clearing

Question Form:
- Errors clear when user starts typing in the field
- Implementation example:
```javascript
onChange={(e) => {
  setTitle(e.target.value);
  if (errors.title) {
    setErrors({ ...errors, title: "" });
  }
}}
```

## Future Improvements

Potential enhancements:
1. Create shared validation utilities in `src/utils/validation.js`
2. Consistent error message styling across all forms
3. Add client-side validation for answer body length
4. Implement validation for comment content
5. Add field-level validation feedback (checkmarks for valid fields)
6. Standardize error message format

## Testing Validation

To test form validation:

1. Question Creation:
   - Try submitting with empty title
   - Try title with 14 characters (too short)
   - Try title with 151 characters (too long)
   - Try submitting without description
   - Try submitting without tags

2. Registration:
   - Try non-dal.ca email
   - Try weak password (no uppercase, no symbol, etc.)

3. Login/Password Reset:
   - Try non-dal.ca email for password reset
   - Try weak password when resetting

---

Document Version: 1.0  
Last Updated: November 29, 2024  
Course: CSCI-5308 - Software Engineering  
Team: Group 02