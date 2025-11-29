# Code Quality Documentation

## Overview

This document outlines the code quality standards, linting rules, and formatting guidelines for the Dal Overflow project.

## Table of Contents
- [Frontend Code Quality](#frontend-code-quality)
- [Backend Code Quality](#backend-code-quality)
- [Quality Metrics](#quality-metrics)
- [Running Quality Checks](#running-quality-checks)
- [Code Review Guidelines](#code-review-guidelines)

## Frontend Code Quality

### Linting Configuration

Location: `frontend/eslint.config.js`

The frontend uses **ESLint 9.36.0** with the following configuration:

#### Enabled Plugins
- `@eslint/js` - Core JavaScript rules
- `eslint-plugin-react-hooks` - React Hooks best practices
- `eslint-plugin-react-refresh` - React Fast Refresh support

#### Language Settings
```javascript
{
  ecmaVersion: 2020,
  sourceType: 'module',
  ecmaFeatures: { jsx: true }
}
```

#### Active Rules

1. **No Unused Variables**
   - Rule: `no-unused-vars: error`
   - Exception: Variables starting with uppercase letters or underscore are ignored
   - Pattern: `^[A-Z_]`
   
   ```javascript
   // Error - unused variable
   const unusedVar = 5;
   
   // OK - starts with uppercase
   const CONSTANT_VALUE = 5;
   
   // OK - starts with underscore
   const _privateVar = 5;
   ```

2. **React Hooks Rules** (from react-hooks/recommended-latest)
   - Rules of Hooks enforced
   - Exhaustive dependencies checked
   - No missing dependencies in useEffect/useCallback/useMemo

3. **React Refresh Rules**
   - Components must be properly exported for Fast Refresh
   - HOCs should preserve component display names

#### Ignored Files
- `dist/` - Build output directory

### Code Formatting Standards

#### File Naming
- Components: PascalCase (e.g., `QuestionTile.jsx`, `CreateQuestion.jsx`)
- Utilities: camelCase (e.g., `useAuth.jsx`)
- CSS files: Match component name (e.g., `QuestionTile.css`)

#### Component Structure
```javascript
// File header with documentation
import React, { useState } from "react";
import "./ComponentName.css";

export default function ComponentName() {
  // State declarations
  const [state, setState] = useState(initialValue);
  
  // Event handlers
  const handleEvent = () => {
    // implementation
  };
  
  // Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
}
```

#### JSX Formatting
- Use double quotes for JSX attributes
- Self-closing tags when no children: `<Component />`
- Proper indentation (2 spaces)
- className for styling, not inline styles (except dynamic styles)

Example from `CreateQuestionPage.jsx`:
```javascript
<input
  id="title"
  type="text"
  className={`form-input ${errors.title ? "form-input--error" : ""}`}
  placeholder="e.g., How do I implement user authentication?"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  maxLength={150}
/>
```

### Running Frontend Linting

```bash
cd frontend

# Run ESLint
npm run lint

# Run linting on specific file
npx eslint src/components/Question/CreateQuestion.jsx

# Auto-fix issues
npx eslint src/ --fix
```

## Backend Code Quality

### Python Code Standards

The backend follows **PEP 8** style guidelines with project-specific conventions.

#### File Structure
```python
"""
Description: Brief description of the module.
Last Modified By: Author Name
Created: YYYY-MM-DD
Last Modified: 
    YYYY-MM-DD - Description of changes.
"""
from module import Class
from database import db

# Code implementation
```

Example from `models/user.py`:
```python
"""
Description: User model for managing application users and their profiles.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created with user authentication and profile management.
"""
from .base_model import BaseModel
from database import db

class User(BaseModel):
    """
    User model representing application users.

    Attributes:
        id (str): Primary key.
        username (str): Username of the user.
        ...
    """
```

#### Naming Conventions

1. **Classes**: PascalCase
   ```python
   class User(BaseModel):
   class Question(db.Model):
   ```

2. **Functions/Methods**: snake_case
   ```python
   def get_questions():
   def create_with_tags(data, tag_ids):
   ```

3. **Variables**: snake_case
   ```python
   question_id = 1
   tag_ids = [1, 2, 3]
   ```

4. **Constants**: UPPER_SNAKE_CASE
   ```python
   MAX_TAGS = 5
   DEFAULT_STATUS = 'open'
   ```

5. **Blueprints**: snake_case with _bp suffix
   ```python
   question_bp = Blueprint('questions', __name__)
   answer_bp = Blueprint('answers', __name__)
   ```

#### Import Organization

Order of imports (example from `routes/question_routes.py`):
```python
# 1. Standard library
import logging

# 2. Third-party packages
from flask import Blueprint, request, jsonify

# 3. Local imports
from middleware.auth_middleware import login_required
from models.question import Question
from utils.fuzzy_search import search_questions
```

#### Function Documentation

All functions should have docstrings:

```python
@question_bp.route('/<int:question_id>', methods=['GET'])
def get_question_by_id(question_id):
    """Get a question by its ID and increment view count.

    Args:
        question_id (int): The ID of the question to retrieve.

    Returns:
        JSON response containing the question details.
        
    Raises:
        404: If question not found.
        500: On internal server error.
    """
```

#### Error Handling

All routes should include try-except blocks:

```python
try:
    question = Question.get_by_id(question_id)
    if not question:
        return jsonify({"message": "Question not found"}), 404
    
    return jsonify({"question": question.to_dict()})
except Exception as e:
    logging.error(f"Error fetching question by ID: {str(e)}")
    return jsonify({"error": "Internal server error"}), 500
```

#### Code Comments

- Use # for inline comments
- Keep comments concise and meaningful
- Explain "why", not "what"

Example from `routes/question_routes.py`:
```python
# Increment view count when question is accessed
question.increment_view_count()

# Extracting tags ids
tag_ids = data.get('tag_ids', [])
```

### Running Backend Quality Checks

```bash
cd backend

# Run pytest tests
pytest

# Run tests with coverage
pytest --cov=. --cov-report=html

# Run tests verbosely
pytest -v

# Run specific test file
pytest test/unit/fuzzy_search_test.py
```

#### Manual Code Review Checklist

Before committing backend code:
- [ ] All functions have docstrings
- [ ] File header includes description and author
- [ ] Error handling with try-except blocks
- [ ] Logging for errors
- [ ] No hardcoded values (use config/environment variables)
- [ ] Input validation for all API endpoints
- [ ] Proper HTTP status codes
- [ ] Tests written for new functionality

## Quality Metrics

### Test Coverage

Current coverage targets:
- **Overall**: 75%+ (enforced in CI/CD)
- **Routes**: 80%+
- **Services**: 75%+
- **Utils**: 90%+
- **Critical paths**: 100% (authentication, validation, security)

See [Test Coverage Report](../testing/test-coverage-report.md) for detailed metrics.

### Code Complexity

Guidelines:
- **Function length**: Maximum 50 lines (exceptions for complex algorithms)
- **Function parameters**: Maximum 5 parameters
- **Nesting depth**: Maximum 4 levels
- **Class length**: Maximum 300 lines

### Performance Metrics

- **API Response Time**: < 200ms for simple queries
- **Database Queries**: Minimize N+1 queries
- **Frontend Bundle Size**: < 500KB (main bundle)
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)

## Running Quality Checks

### CI/CD Pipeline

Quality checks run automatically on:
- Every push to develop branch
- Every pull request
- Before deployment

Example GitLab CI configuration:
```yaml
test-frontend:
  stage: test
  script:
    - cd frontend
    - npm install
    - npm run lint
    
test-backend:
  stage: test
  script:
    - cd backend
    - pip install -r requirements.txt
    - pytest --cov=. --cov-report=term --cov-fail-under=75
```

### Pre-commit Checks

Recommended pre-commit script (`.git/hooks/pre-commit`):
```bash
#!/bin/bash

# Frontend linting
cd frontend && npm run lint
if [ $? -ne 0 ]; then
    echo "Frontend linting failed. Please fix errors before committing."
    exit 1
fi

# Backend tests
cd ../backend && pytest
if [ $? -ne 0 ]; then
    echo "Backend tests failed. Please fix before committing."
    exit 1
fi

echo "All quality checks passed!"
```

## Code Review Guidelines

### What to Look For

#### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] No obvious bugs

#### Code Quality
- [ ] Follows naming conventions
- [ ] Proper error handling
- [ ] No code duplication
- [ ] Functions are focused and single-purpose

#### Testing
- [ ] Tests are included for new features
- [ ] Tests cover edge cases
- [ ] Tests are readable and maintainable

#### Documentation
- [ ] Docstrings for all functions
- [ ] Comments for complex logic
- [ ] README updated if needed

#### Security
- [ ] No hardcoded credentials
- [ ] Input validation present
- [ ] SQL injection prevention (using ORM)
- [ ] XSS prevention (using sanitization)

### Review Process

1. **Author**: Create merge request with clear description
2. **Reviewer**: Review within 24 hours
3. **Author**: Address feedback
4. **Reviewer**: Approve or request changes
5. **Author**: Merge after approval and passing CI/CD

## Common Issues and Solutions

### Frontend

**Issue**: ESLint errors about unused variables
```javascript
// Bad
const result = await fetch(url);

// Good - if not using result
await fetch(url);

// Good - if result is intentionally unused
const _result = await fetch(url);
```

**Issue**: React Hook dependencies warning
```javascript
// Bad
useEffect(() => {
  fetchData(id);
}, []); // Missing 'id' in dependencies

// Good
useEffect(() => {
  fetchData(id);
}, [id]); // Include all dependencies
```

### Backend

**Issue**: Missing docstrings
```python
# Bad
def process_data(data):
    return data.upper()

# Good
def process_data(data):
    """Convert data to uppercase.
    
    Args:
        data (str): Input string.
        
    Returns:
        str: Uppercase version of input.
    """
    return data.upper()
```

**Issue**: Bare except clause
```python
# Bad
try:
    do_something()
except:
    pass

# Good
try:
    do_something()
except ValueError as e:
    logging.error(f"Error: {str(e)}")
    return jsonify({"error": "Invalid data"}), 400
```

## Tools and Dependencies

### Frontend
- **ESLint**: 9.36.0
- **Vite**: 7.1.7 (build tool)
- **React**: 18.3.1

### Backend
- **pytest**: 8.4.2 (testing framework)
- **pytest-cov**: 7.0.0 (coverage reporting)
- **Python**: 3.10+ (recommended)

## Future Improvements

Planned enhancements:
1. Add Prettier for frontend code formatting
2. Implement Black/autopep8 for Python code formatting
3. Add pre-commit hooks automation
4. Integrate code quality dashboard
5. Add complexity analysis tools (radon, sonar)
6. Implement automated security scanning

---

Document Version: 1.0  
Last Updated: November 29, 2024  
Course: CSCI-5308 - Software Engineering  
Team: Group 02