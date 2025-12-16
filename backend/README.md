# Backend

Flask + Postgresql backend.

## Quick Start

```bash
# Run setup script
chmod +x setup.sh
./setup.sh

# Activate virtual environment
source venv/bin/activate

# Start the server
python app.py
```

## API Endpoints

### AI

- `POST /api/ai/answer` - Generate an AI answer for a question
- `POST /api/ai/summarize` - Generate an AI summary of an answer and its comments

### Answer

- `GET /api/answers/questions/{question_id}/answers` - Get all answers for a question
- `GET /api/answers/questions/{question_id}/answers/count` - Get answer count for a question
- `POST /api/answers/questions/{question_id}/answers` - Create an answer for a question
- `GET /api/answers/{answer_id}/comments` - Get all comments for an answer

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-otp` - Verify OTP for registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check-login` - Check if user is logged in
- `GET /api/auth/login` - Get login status
- `GET /api/auth/validate` - Validate session

### Comment

- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create a comment
- `PATCH /api/comments/{comment_id}` - Update a comment
- `DELETE /api/comments/{comment_id}` - Delete a comment

### Notification

- `GET /api/notifications/{user_id}` - Get all notifications for a user
- `POST /api/notifications` - Create a notification

### Question

- `GET /api/questions` - Get all questions
- `GET /api/questions/{question_id}` - Get question by id
- `POST /api/questions` - Create a question
- `GET /api/questions/search` - Search questions

### Question Tag

- `GET /api/questions/{question_id}/tags` - Get all tags for a question
- `GET /api/tags/{tag_id}/questions` - Get all questions for a tag

### Tag

- `GET /api/tags` - Get all tags
- `GET /api/tags/{tag_id}` - Get tag by id
- `POST /api/tags` - Create a tag

### User

- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get user by id
- `POST /api/users` - Create a user

### Vote

- `GET /api/votes` - Get all votes
- `POST /api/votes` - Create a vote
- `GET /api/votes/{target_type}/{target_id}` - Get votes for a target (question/answer)
- `PATCH /api/votes/{vote_id}` - Update a vote
- `GET /api/votes/user` - Get votes by current user
