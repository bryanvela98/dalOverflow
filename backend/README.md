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
