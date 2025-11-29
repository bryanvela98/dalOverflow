# Unit Testing Guide

**Dal Overflow Project - Unit Testing Documentation**

## Table of Contents
- [Overview](#overview)
- [What is Unit Testing](#what-is-unit-testing)
- [Our Unit Test Structure](#our-unit-test-structure)
- [Using Mocks](#using-mocks)
- [Writing Unit Tests](#writing-unit-tests)
- [Test Examples from Our Project](#test-examples-from-our-project)
- [Best Practices](#best-practices)
- [Running Unit Tests](#running-unit-tests)

## Overview

Unit tests verify that individual functions and methods work correctly in isolation. They are fast, focused tests that use mocks to eliminate dependencies on external systems like databases or APIs.

## What is Unit Testing

Unit testing focuses on:
- **Single Functions**: Testing one function at a time
- **Isolation**: No dependencies on database, network, or file system
- **Mocking**: Simulating external dependencies
- **Fast Execution**: Tests run in milliseconds
- **Clear Failures**: Pinpoint exactly what broke

### Why Unit Tests?

```
┌──────────────────────────────────────────────────┐
│         Benefits of Unit Testing                 │
└──────────────────────────────────────────────────┘

✓ Fast Feedback        - Tests run in milliseconds
✓ Isolated Failures    - Easy to identify broken code
✓ Design Validation    - Forces modular design
✓ Refactoring Safety   - Catch regressions immediately
✓ Documentation        - Tests show how code should work
```

## Our Unit Test Structure

### File Organization

```
backend/test/unit/
├── answer_test.py              # Answer validation & creation
├── fuzzy_search_test.py        # Search algorithm
├── html_sanitization_test.py   # XSS protection
├── user_login_test.py          # Login validation
├── user_registration_test.py   # Registration logic
└── test_config.py              # Configuration validation
```

### What We Unit Test

1. **Business Logic** - Validation, calculations, algorithms
2. **Utilities** - Helper functions (search, sanitization)
3. **Services** - Business services (login, registration)
4. **Configuration** - Environment variable handling

### What We DON'T Unit Test

1. **API Routes** - Use integration tests instead
2. **Database Queries** - Use integration tests instead
3. **Full Workflows** - Use integration tests instead

## Using Mocks

### Why Mock?

Mocks simulate external dependencies so tests remain fast and isolated:

```python
# Without mocking (slow, database dependent)
def test_user_exists():
    user = User(email="test@dal.ca")
    db.session.add(user)  # Real database call
    db.session.commit()
    
    result = UserService.user_exists("test@dal.ca")
    assert result is True

# With mocking (fast, isolated)
def test_user_exists():
    User.query = MagicMock()
    User.query.filter_by().first = MagicMock(return_value=mock_user)
    
    result = UserService.user_exists("test@dal.ca")
    assert result is True
```

### MagicMock Basics

```python
from unittest.mock import MagicMock

# Create a mock object
mock_user = MagicMock()
mock_user.email = "test@dal.ca"
mock_user.password = "hashed_password"

# Mock method returns
mock_service = MagicMock()
mock_service.validate_email = MagicMock(return_value=True)

# Mock database queries
User.query = MagicMock()
User.query.filter_by = MagicMock()
User.query.filter_by().first = MagicMock(return_value=mock_user)
```

### Patch Decorator

```python
from unittest.mock import patch

# Patch function for single test
@patch('utils.fuzzy_search.get_all_questions')
def test_search(mock_get):
    mock_get.return_value = [{'id': 1, 'title': 'Test'}]
    results = search_questions('Test')
    assert len(results) == 1

# Patch multiple functions
@patch('services.user_registration.send_email')
@patch('services.user_registration.generate_otp')
def test_registration(mock_otp, mock_email):
    mock_otp.return_value = '123456'
    # Test code here
```

## Writing Unit Tests

### Basic Test Structure

```python
import unittest
from unittest.mock import MagicMock
from services.my_service import MyService

class TestMyService(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures"""
        self.service = MyService()
        self.mock_db = MagicMock()
    
    def test_function_with_valid_input(self):
        """Test function succeeds with valid input"""
        result = self.service.my_function('valid_input')
        self.assertTrue(result)
    
    def test_function_with_invalid_input(self):
        """Test function fails with invalid input"""
        result = self.service.my_function('invalid')
        self.assertFalse(result)

if __name__ == '__main__':
    unittest.main()
```

## Test Examples from Our Project

### 1. User Registration Tests

**File**: `backend/test/unit/user_registration_test.py`

#### Testing User Existence Check

```python
class TestUserRegistration(unittest.TestCase):
    
    def setUp(self):
        self.mock_db = MagicMock()
    
    def test_user_exists(self):
        """Test checking if user exists in database"""
        mock_user = MagicMock()
        
        # Mock database query
        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(
            return_value=mock_user
        )
        
        result = UserRegistrationService().user_exists("test@dal.ca")
        
        assert result is True
    
    def test_user_not_exists(self):
        """Test when user doesn't exist"""
        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(
            return_value=None  # No user found
        )
        
        result = UserRegistrationService().user_exists("test@dal.ca")
        
        assert result is False
```

#### Testing User Creation Logic

```python
def test_create_user_exists(self):
    """Test that user creation fails if user already exists"""
    registration = UserRegistrationService()
    
    # Mock user_exists to return True
    registration.user_exists = MagicMock(return_value=True)
    
    result = registration.create_user("test@dal.ca", "testpass")
    
    # Should return False - user already exists
    assert result is False

def test_create_user_not_exists(self):
    """Test user creation succeeds for new user"""
    registration = UserRegistrationService()
    
    # Mock user_exists to return False
    registration.user_exists = MagicMock(return_value=False)
    
    result = registration.create_user("test@dal.ca", "testpass")
    
    # Should return True - user created
    assert result is True
```

#### Testing Email Validation

```python
def test_validate_email_contains(self):
    """Test email validation passes for dal.ca email"""
    registration = UserRegistrationService()
    
    result = registration.validate_email("test@dal.ca")
    
    assert result is True

def test_validate_email_not_contains(self):
    """Test email validation fails for non-dal.ca email"""
    registration = UserRegistrationService()
    
    result = registration.validate_email("test@gmail.com")
    
    assert result is False
```

#### Testing OTP Verification

```python
def test_verify_and_create_user_correct_otp(self):
    """Test user creation with correct OTP"""
    registration = UserRegistrationService()
    
    # Mock OTP check to return True
    registration.check_otp = MagicMock(return_value=True)
    
    result = registration.verify_and_create_user("123456")
    
    assert result is True

def test_verify_and_create_user_incorrect_otp(self):
    """Test user creation fails with incorrect OTP"""
    registration = UserRegistrationService()
    
    # Mock OTP check to return False
    registration.check_otp = MagicMock(return_value=False)
    
    result = registration.verify_and_create_user("123456")
    
    assert result is False
```

### 2. User Login Tests

**File**: `backend/test/unit/user_login_test.py`

```python
class TestUserLogin(unittest.TestCase):
    
    def setUp(self):
        self.mock_db = MagicMock()
    
    def test_verify_credentials_success(self):
        """Test login with correct credentials"""
        mock_user = MagicMock()
        mock_user.email = "test@dal.ca"
        mock_user.password = "testpassword"
        
        # Mock database query
        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(
            return_value=mock_user
        )
        
        login = UserLoginServices()
        result = login.verify_credentials("test@dal.ca", "testpassword")
        
        assert result is True
    
    def test_verify_credentials_wrong_password(self):
        """Test login fails with wrong password"""
        mock_user = MagicMock()
        mock_user.email = "test@dal.ca"
        mock_user.password = "wrongpassword"
        
        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(
            return_value=mock_user
        )
        
        login = UserLoginServices()
        result = login.verify_credentials("test@dal.ca", "testpassword")
        
        assert result is False
    
    def test_verify_credentials_user_not_exists(self):
        """Test login fails when user doesn't exist"""
        User.query = MagicMock()
        User.query.filter_by = MagicMock()
        User.query.filter_by.return_value.first = MagicMock(
            return_value=None  # No user found
        )
        
        login = UserLoginServices()
        result = login.verify_credentials("nonexistent@dal.ca", "anypassword")
        
        assert result is False
```

### 3. HTML Sanitization Tests

**File**: `backend/test/unit/html_sanitization_test.py`

```python
from utils.html_sanitizer import sanitize_html_body

class TestHtmlSanitization(unittest.TestCase):
    
    def test_sanitize_dangerous_script_tags(self):
        """Test that script tags are removed"""
        input_html = '<p>Safe</p><script>alert("XSS")</script>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('<script>', result)
        self.assertNotIn('alert', result)
        self.assertIn('<p>Safe</p>', result)
    
    def test_preserve_safe_html_formatting(self):
        """Test that safe HTML is preserved"""
        input_html = '<p><strong>bold</strong> and <em>italic</em></p>'
        
        result = sanitize_html_body(input_html)
        
        self.assertIn('<strong>bold</strong>', result)
        self.assertIn('<em>italic</em>', result)
        self.assertEqual(result, input_html)
    
    def test_remove_dangerous_attributes(self):
        """Test that dangerous attributes are removed"""
        input_html = '<p onclick="alert(\'XSS\')">Click me</p>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('onclick', result)
        self.assertIn('<p>Click me</p>', result)
    
    def test_empty_content(self):
        """Test handling of empty content"""
        self.assertEqual(sanitize_html_body(''), '')
        self.assertEqual(sanitize_html_body(None), '')
    
    def test_plain_text_content(self):
        """Test that plain text passes through"""
        input_text = 'Plain text with no HTML.'
        result = sanitize_html_body(input_text)
        self.assertEqual(result, input_text)
    
    def test_case_insensitive_script_removal(self):
        """Test script tags removed regardless of case"""
        input_html = '<p>Safe</p><SCRIPT>alert("XSS")</SCRIPT>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('alert', result)
        self.assertEqual(result, '<p>Safe</p>')
    
    def test_allowed_link_attributes(self):
        """Test that allowed attributes are preserved"""
        input_html = '<p><a href="https://dal.com" title="dal">Link</a></p>'
        
        result = sanitize_html_body(input_html)
        
        self.assertIn('href="https://dal.com"', result)
        self.assertIn('title="dal"', result)
    
    def test_disallowed_protocols(self):
        """Test that disallowed protocols are removed"""
        input_html = '<a href="javascript:alert(\'XSS\')">Bad Link</a>'
        
        result = sanitize_html_body(input_html)
        
        self.assertNotIn('javascript:', result)
        self.assertIn('<a>Bad Link</a>', result)
```

### 4. Fuzzy Search Tests

**File**: `backend/test/unit/fuzzy_search_test.py`

```python
from unittest.mock import patch
from utils.fuzzy_search import search_questions

class TestFuzzySearchBasic(unittest.TestCase):
    
    def test_search_exact_match_returns_result(self):
        """Test exact match returns high score"""
        mock_questions = [
            {'id': 1, 'title': 'what is the most common use of flask?'},
            {'id': 2, 'title': 'what is the easiest Python Guide?'}
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results = search_questions('what is the most common use of flask?')
            
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]['id'], 1)
            self.assertGreater(results[0]['score'], 0.8)
    
    def test_search_empty_query_returns_empty(self):
        """Test empty query returns no results"""
        results = search_questions('')
        self.assertEqual(results, [])
        
        results = search_questions('   ')  # Whitespace only
        self.assertEqual(results, [])
    
    def test_search_partial_match_lower_score(self):
        """Test partial matches return lower scores"""
        mock_questions = [
            {'id': 1, 'title': 'what is the Flask Web Development?'}
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results = search_questions('Flask')
            
            self.assertEqual(len(results), 1)
            self.assertLess(results[0]['score'], 1.0)
            self.assertGreater(results[0]['score'], 0.0)
    
    def test_search_no_match_returns_empty(self):
        """Test queries with no matches return empty"""
        mock_questions = [
            {'id': 1, 'title': 'Flask Tutorial'}
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results = search_questions('JavaScript')
            
            self.assertEqual(results, [])
    
    def test_search_word_order_independent(self):
        """Test word order doesn't affect matching"""
        mock_questions = [
            {'id': 1, 'title': 'whats the best Python Flask Tutorial?'}
        ]
        
        with patch('utils.fuzzy_search.get_all_questions') as mock_get:
            mock_get.return_value = mock_questions
            
            results1 = search_questions('Flask Python')
            results2 = search_questions('Python Flask')
            
            self.assertEqual(len(results1), 1)
            self.assertEqual(len(results2), 1)
            self.assertEqual(results1[0]['score'], results2[0]['score'])
```

### 5. Answer Validation Tests

**File**: `backend/test/unit/answer_test.py`

```python
from services.answer_services import AnswerServices

class TestAnswerValidation(unittest.TestCase):
    
    def setUp(self):
        self.answer_service = AnswerServices()
    
    def test_validate_answer_body_valid(self):
        """Test valid answer body passes validation"""
        body = "This is a valid answer with sufficient length."
        
        result = self.answer_service.validate_answer_body(body)
        
        self.assertTrue(result)

class TestAnswerCreation(unittest.TestCase):
    
    def setUp(self):
        self.answer_service = AnswerServices()
    
    def test_create_answer_with_valid_data(self):
        """Test creating answer with valid data"""
        # Mock question exists
        mock_question = MagicMock()
        mock_question.id = 1
        
        Question.query = MagicMock()
        Question.query.get = MagicMock(return_value=mock_question)
        
        result = self.answer_service.create_answer(
            question_id=1,
            user_id=1,
            body="Valid answer body with sufficient length."
        )
        
        self.assertIsNotNone(result)
        self.assertEqual(result.question_id, 1)
    
    def test_create_answer_with_invalid_body(self):
        """Test creating answer with short body fails"""
        result = self.answer_service.create_answer(
            question_id=1,
            user_id=1,
            body="short"
        )
        
        self.assertIsNone(result)
    
    def test_create_answer_with_nonexistent_question(self):
        """Test creating answer for non-existent question"""
        Question.query = MagicMock()
        Question.query.get = MagicMock(return_value=None)
        
        result = self.answer_service.create_answer(
            question_id=999,
            user_id=1,
            body="Valid answer body."
        )
        
        self.assertIsNone(result)

class TestAnswerRetrieval(unittest.TestCase):
    
    def test_get_answers_by_question_id(self):
        """Test retrieving answers for a question"""
        mock_answer1 = MagicMock()
        mock_answer1.id = 1
        mock_answer1.question_id = 1
        
        mock_answer2 = MagicMock()
        mock_answer2.id = 2
        mock_answer2.question_id = 1
        
        Answer.query = MagicMock()
        Answer.query.filter_by = MagicMock()
        Answer.query.filter_by.return_value.all = MagicMock(
            return_value=[mock_answer1, mock_answer2]
        )
        
        result = AnswerServices().get_answers_by_question(question_id=1)
        
        self.assertEqual(len(result), 2)

class TestAnswerCount(unittest.TestCase):
    
    def test_count_answers_for_question(self):
        """Test counting answers for a question"""
        Answer.query = MagicMock()
        Answer.query.filter_by = MagicMock()
        Answer.query.filter_by.return_value.count = MagicMock(return_value=3)
        
        result = AnswerServices().count_answers_by_question(question_id=1)
        
        self.assertEqual(result, 3)
```

### 6. Configuration Tests

**File**: `backend/test/unit/test_config.py`

```python
import unittest
import os
from unittest.mock import patch
from config.config_postgres import Config

class TestConfig(unittest.TestCase):
    
    @patch.dict(os.environ, {
        "DATABASE_URL": "postgresql://test_url",
        "SECRET_KEY": "unit-test-secret"
    }, clear=True)
    def test_config_loads_env_vars(self):
        """Test Config reads environment variables correctly"""
        self.assertEqual(Config.SQLALCHEMY_DATABASE_URI, "postgresql://test_url")
        self.assertEqual(Config.SECRET_KEY, "unit-test-secret")
        self.assertFalse(Config.SQLALCHEMY_TRACK_MODIFICATIONS)
    
    @patch.dict(os.environ, {}, clear=True)
    def test_config_fallback(self):
        """Test Config uses fallback values"""
        # Should use default/fallback values when env vars missing
        self.assertEqual(Config.SECRET_KEY, "dev-secret")
```

## Best Practices

### 1. Test One Thing Per Test

Each test should focus on a single behavior:

```python
def test_validate_email_with_valid_format(self):
    """Test email validation with valid format"""
    result = validate_email("test@dal.ca")
    self.assertTrue(result)

def test_validate_email_with_invalid_format(self):
    """Test email validation with invalid format"""
    result = validate_email("invalid-email")
    self.assertFalse(result)
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested:

```python
def test_create_user_fails_when_user_already_exists(self):
def test_sanitize_removes_script_tags(self):
def test_search_returns_empty_for_no_matches(self):
```

### 3. Arrange-Act-Assert Pattern

```python
def test_function(self):
    # ARRANGE - Set up test data
    mock_data = MagicMock()
    service = MyService()
    
    # ACT - Execute function
    result = service.my_function(mock_data)
    
    # ASSERT - Verify result
    self.assertTrue(result)
```

### 4. Mock External Dependencies

```python
# Mock database queries
User.query = MagicMock()
User.query.filter_by().first = MagicMock(return_value=mock_user)

# Mock function calls
with patch('module.function') as mock_func:
    mock_func.return_value = expected_value
    # Test code
```

### 5. Test Edge Cases

```python
def test_with_empty_input(self):
    """Test function with empty input"""
    result = my_function('')
    self.assertEqual(result, expected)

def test_with_none_input(self):
    """Test function with None input"""
    result = my_function(None)
    self.assertEqual(result, expected)

def test_with_special_characters(self):
    """Test function with special characters"""
    result = my_function('<script>alert("xss")</script>')
    self.assertEqual(result, expected)
```

## Running Unit Tests

### Run All Unit Tests

```bash
cd backend
pytest test/unit/
```

### Run Specific Test File

```bash
pytest test/unit/fuzzy_search_test.py
```

### Run Specific Test Class

```bash
pytest test/unit/user_registration_test.py::TestUserRegistration
```

### Run Specific Test Method

```bash
pytest test/unit/user_registration_test.py::TestUserRegistration::test_user_exists
```

### Run with Verbose Output

```bash
pytest test/unit/ -v
```

### Run with Coverage

```bash
pytest test/unit/ --cov=services --cov=utils --cov-report=html
```

## Common Assertions

```python
# Equality
self.assertEqual(actual, expected)
self.assertNotEqual(actual, expected)

# Boolean
self.assertTrue(value)
self.assertFalse(value)

# None
self.assertIsNone(value)
self.assertIsNotNone(value)

# Membership
self.assertIn(item, container)
self.assertNotIn(item, container)

# Type checking
self.assertIsInstance(obj, SomeClass)

# Exceptions
with self.assertRaises(ValueError):
    function_that_raises()

# Numeric comparisons
self.assertGreater(a, b)
self.assertLess(a, b)
self.assertGreaterEqual(a, b)
```

## Troubleshooting

### Issue: Mock Not Working

**Problem**: Mock doesn't affect test

**Solution**: Patch the right location

```python
# If service.py imports like this:
from models.user import User

# Patch where it's used, not where it's defined
@patch('services.user_service.User')
def test_function(mock_user):
    # ...
```



**Document Version**: 1.0  
**Last Updated**: November 29, 2024  
**Course**: CSCI-5308 - Software Engineering  
**Team**: Group 02