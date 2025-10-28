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

### Notification

- `GET /api/notifications/{user_id}` - Get all notifications for one use
- `POST /api/notifications` - Create a notification

### Question Tag

### User

- `GET /api/users` - Get all users
- `POST /api/users` - Create a user

### Question

- `GET /api/questions` - Get all questions
- `GET /api/questions/{id}` - Get question by id
- `POST /api/questions/` - Create question
