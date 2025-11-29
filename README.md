# Dal Overflow

A Stack Overflow-like Q&A platform designed specifically for Dalhousie University students and faculty.

## 📋 Table of Contents
- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About the Project

Dal Overflow is a comprehensive Q&A platform that enables the Dalhousie University community to ask questions, share knowledge, and collaborate on academic and technical topics. Built as part of CSCI-5308 Software Engineering course.

## ✨ Features

- **User Authentication & Authorization**: Secure login and registration with JWT tokens
- **Question Management**: Create, view, edit, and delete questions with rich text editor
- **Answer System**: Post and manage answers to questions
- **Voting System**: Upvote/downvote questions and answers
- **Comment System**: Engage in discussions through comments
- **Tag System**: Organize and filter questions by topics
- **Notification System**: Real-time updates on user activity
- **Search Functionality**: Fuzzy search to find relevant questions
- **User Profiles**: Track user activity and contributions
- **Rich Text Editing**: Support for formatted text with React Quill
- **Syntax Highlighting**: Code snippet display with syntax highlighting
- **XSS Protection**: HTML sanitization for secure user input

## 🛠️ Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **React Router DOM** 7.9.4 - Client-side routing with protected routes
- **Axios** 1.12.2 - HTTP client for API communication
- **Vite** 7.1.7 - Build tool and development server
- **React Quill** 2.0.0 - Rich text editor
- **React Syntax Highlighter** 16.1.0 - Code syntax highlighting
- **TypeScript** - Type definitions for React
- **bcryptjs** 3.0.3 - Client-side password utilities
- **ESLint** 9.36.0 - Code linting

### Backend
- **Flask** 3.1.2 - Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** 2.0.44 - ORM for database operations
- **Flask-SQLAlchemy** 3.1.1 - Flask integration for SQLAlchemy
- **Flask-CORS** 6.0.1 - Cross-Origin Resource Sharing
- **bcrypt** 4.0.1 - Password hashing
- **PyJWT** 2.8.0 - JSON Web Token authentication
- **psycopg2-binary** 2.9.11 - PostgreSQL adapter
- **pytest** 8.4.2 - Testing framework
- **pytest-cov** 7.0.0 - Code coverage
- **python-dotenv** 1.2.1 - Environment variable management
- **bleach** 6.2.0 - HTML sanitization

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Python** 3.8 or higher
- **PostgreSQL** 12 or higher
- Access to Dal CS VM server

### Installation

1. **Clone the repository**
```bash
git clone https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02.git
cd group02
```

2. **Backend Setup**
```bash
cd backend
chmod +x setup.sh
./setup.sh
source venv/bin/activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DB_URL=postgresql://student:Thah1eith8@csci5308-vm2.research.cs.dal.ca:5432/daloverflow

# Flask Configuration
SECRET_KEY=your-secret-key-here
PORT=5001

# Optional: Database URL (alternative)
DATABASE_URL=postgresql://student:Thah1eith8@csci5308-vm2.research.cs.dal.ca:5432/daloverflow
```

**Security Note**: Never commit the `.env` file to version control. The credentials above are for development only.

### Database Setup

The project uses a shared PostgreSQL database hosted on Dal CS VM server.

**Accessing the Database:**

1. **SSH into the VM server:**
```bash
ssh student@csci5308-vm2.research.cs.dal.ca
```
Password: `Thah1eith8`

2. **Connect to PostgreSQL:**
```bash
sudo -u postgres psql
```
Password: `Thah1eith8`

3. **Connect to the daloverflow database:**
```sql
\c daloverflow
```

**Common PostgreSQL Commands:**
```sql
-- List all tables
\dt

-- View table schema
\d table_name

-- View all users
SELECT * FROM "user";

-- View all questions
SELECT * FROM question;

-- List all databases
\l

-- Exit psql
\q
```

**Database Initialization:**

The application automatically creates all necessary tables on first run using SQLAlchemy's `db.create_all()`. Additionally, it seeds the database with sample tags from `backend/data/tags.json` if no tags exist.

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
source venv/bin/activate
python app.py
```
Backend will run on `http://localhost:5001`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173` (Vite default port)

**Available Frontend Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

The backend is configured to accept CORS requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:5000`
- `http://localhost:5173`

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Dal Overflow                             │
│                    Q&A Platform Architecture                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   React Frontend │◄───────►│  Flask Backend   │◄───────►│   PostgreSQL     │
│   (Port 5173)    │  HTTP   │   (Port 5001)    │  SQL    │    Database      │
│                  │  /API   │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                             │
        │                            │                             │
        ▼                            ▼                             ▼
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  • React Router  │         │  • Flask-CORS    │         │  • Users         │
│  • Axios         │         │  • SQLAlchemy    │         │  • Questions     │
│  • React Quill   │         │  • JWT Auth      │         │  • Answers       │
│  • Syntax        │         │  • Blueprints    │         │  • Tags          │
│    Highlighter   │         │  • Middleware    │         │  • Votes         │
│  • useAuth Hook  │         │  • HTML Sanitize │         │  • Notifications │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

### Application Flow

```
User Request Flow:
─────────────────

1. User Authentication
   Browser → Login Component → POST /api/auth/login → User Service
   → Password Validation (bcrypt) → JWT Generation → Token Response

2. Question Creation
   Browser → CreateQuestion Component (React Quill) → POST /api/questions
   → Auth Middleware (JWT Validation) → HTML Sanitization (bleach)
   → Question Model → Database → Response

3. Question Display
   Browser → GET /api/questions → Question Routes → SQLAlchemy Query
   → Database → Question Data + Tags → JSON Response
   → QuestionTile Component → Render with Syntax Highlighting
```

### Database Schema

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │         │   Question   │         │     Tag     │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │────┐    │ id (PK)      │    ┌────│ id (PK)     │
│ username    │    │    │ title        │    │    │ tag_name    │
│ email       │    │    │ content      │    │    │ description │
│ password    │    └───►│ user_id (FK) │    │    └─────────────┘
│ created_at  │         │ created_at   │    │           │
└─────────────┘         │ updated_at   │    │           │
       │                └──────────────┘    │           │
       │                       │             │           │
       │                       │             │           │
       ▼                       ▼             ▼           ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Answer    │         │ QuestionTag  │         │    Vote     │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │         │ question_id  │         │ id (PK)     │
│ content     │         │ tag_id       │         │ user_id     │
│ user_id(FK) │         │ (Association)│         │ question_id │
│question_id  │         └──────────────┘         │ vote_type   │
│ created_at  │                                  └─────────────┘
└─────────────┘
```

### Component Hierarchy (Frontend)

```
App.jsx
│
├── Routes.jsx
│   │
│   ├── PublicRoutes
│   │   ├── LandingPage.jsx
│   │   └── LoginRegistration.jsx
│   │       ├── Login.jsx
│   │       └── UserRegistration.jsx
│   │
│   └── ProtectedRoutes (useAuth)
│       ├── QuestionPage.jsx
│       │   ├── Header.jsx
│       │   │   ├── LoginButton.jsx
│       │   │   └── NotificationBell.jsx
│       │   │       └── NotificationDropdown.jsx
│       │   ├── Sidebar.jsx
│       │   ├── QuestionTile.jsx (list)
│       │   └── RightBar.jsx
│       │       └── NewQuestionButton.jsx
│       │
│       ├── CreateQuestionPage.jsx
│       │   └── CreateQuestion.jsx
│       │       └── React Quill Editor
│       │
│       ├── QuestionDetailPage.jsx
│       │   └── QuestionDetailContainer.jsx
│       │       ├── QuestionDetail.jsx
│       │       └── BasicQuestionDetail.jsx
│       │
│       └── TagsPage.jsx
│           └── Tags.jsx
```

## 📡 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Question Endpoints
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get specific question
- `POST /api/questions` - Create new question (requires auth)
- `PUT /api/questions/:id` - Update question (requires auth)
- `DELETE /api/questions/:id` - Delete question (requires auth)

### Tag Endpoints
- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get specific tag
- `POST /api/tags` - Create new tag (requires auth)

### Question-Tag Endpoints
- `POST /api/questions/:id/tags` - Add tags to question (requires auth)
- `GET /api/questions/:id/tags` - Get question tags

### User Endpoints
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (requires auth)

### Notification Endpoints
- `GET /api/notifications` - Get user notifications (requires auth)
- `PUT /api/notifications/:id` - Mark notification as read (requires auth)

**Authentication**: Most endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

```
GROUP02/
│
├── backend/                    # Flask backend application
│   ├── config/                # Configuration files
│   │   ├── __init__.py
│   │   ├── config_postgres.py # PostgreSQL configuration with dotenv
│   │   └── test-config.py     # Test configuration
│   │
│   ├── data/                  # Static data files
│   │   ├── questions.json     # Sample questions (unused in seeding)
│   │   └── tags.json          # Sample tags (used for initial seeding)
│   │
│   ├── middleware/            # Custom middleware
│   │   └── auth_middleware.py # JWT authentication middleware
│   │
│   ├── models/                # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── answer.py          # Answer model
│   │   ├── base_model.py      # Base model class with common methods
│   │   ├── notification.py    # Notification model
│   │   ├── question.py        # Question model
│   │   ├── questiontag.py     # Question-Tag association table
│   │   ├── tag.py             # Tag model
│   │   ├── user.py            # User model with password hashing
│   │   └── vote.py            # Vote model
│   │
│   ├── routes/                # API endpoints (Flask Blueprints)
│   │   ├── __init__.py
│   │   ├── login_routes.py           # POST /api/auth/login
│   │   ├── notification_routes.py    # /api/notifications/*
│   │   ├── question_routes.py        # /api/questions/*
│   │   ├── questiontag_routes.py     # /api/questions/:id/tags
│   │   ├── registration_routes.py    # POST /api/auth/register
│   │   ├── tag_routes.py             # /api/tags/*
│   │   └── user_routes.py            # /api/users/*
│   │
│   ├── services/              # Business logic layer
│   │   ├── __init__.py
│   │   ├── user_login.py      # Login validation and JWT generation
│   │   └── user_registration.py # User registration logic
│   │
│   ├── test/                  # Test suite
│   │   ├── integration/       # Integration tests
│   │   │   ├── question_routes_test.py
│   │   │   └── question_tag_routes_test.py
│   │   ├── unit/              # Unit tests
│   │   │   ├── fuzzy_search_test.py
│   │   │   ├── html_sanitization_test.py
│   │   │   ├── test_user_redirect.py
│   │   │   ├── user_login_test.py
│   │   │   └── user_registration_test.py
│   │   └── test_base.py       # Test base configuration
│   │
│   ├── utils/                 # Utility functions
│   │   ├── __init__.py
│   │   ├── fuzzy_search.py    # Fuzzy search implementation
│   │   └── html_sanitizer.py  # XSS protection using bleach
│   │
│   ├── .env                   # Environment variables (not in git)
│   ├── .gitignore            # Git ignore file
│   ├── app.py                # Main application entry point
│   ├── database.py           # SQLAlchemy db instance initialization
│   ├── requirements.txt      # Python dependencies
│   └── setup.sh              # Backend setup script
│
├── frontend/                   # React frontend application
│   ├── public/                # Static assets
│   │
│   ├── src/
│   │   ├── assets/            # Images and static files
│   │   │   └── react.svg
│   │   │
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Header/        # Navigation header
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Header.css
│   │   │   │
│   │   │   ├── NotificationBell/  # Notification system
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   ├── NotificationBell.css
│   │   │   │   ├── NotificationDropdown.jsx
│   │   │   │   └── NotificationDropdown.css
│   │   │   │
│   │   │   ├── Question/      # Question components
│   │   │   │   ├── BasicQuestionDetail.jsx
│   │   │   │   ├── BasicQuestionDetail.css
│   │   │   │   ├── CreateQuestion.jsx
│   │   │   │   ├── CreateQuestionPage.jsx
│   │   │   │   ├── CreateQuestionPage.css
│   │   │   │   ├── QuestionDetail.jsx
│   │   │   │   ├── QuestionDetailContainer.jsx
│   │   │   │   ├── QuestionDetailPage.css
│   │   │   │   ├── QuestionDetailPage.jsx
│   │   │   │   ├── QuestionTile.jsx
│   │   │   │   └── QuestionTile.css
│   │   │   │
│   │   │   ├── Tags/          # Tag components
│   │   │   │   ├── Tags.jsx
│   │   │   │   ├── TagsPage.css
│   │   │   │   └── TagsPage.jsx
│   │   │   │
│   │   │   ├── UserRegistrationLogin/  # Auth components
│   │   │   │   ├── Login.jsx
│   │   │   │   └── UserRegistration.jsx
│   │   │   │
│   │   │   ├── LoginButton.jsx        # Reusable login button
│   │   │   ├── NewQuestionButton.jsx  # Create question button
│   │   │   ├── RightBar.jsx           # Right sidebar component
│   │   │   └── Sidebar.jsx            # Left sidebar navigation
│   │   │
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useAuth.jsx    # Authentication hook
│   │   │
│   │   ├── pages/             # Page-level components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginRegistration.jsx
│   │   │   └── QuestionPage.jsx
│   │   │
│   │   ├── routes/            # Routing configuration
│   │   │   ├── ProtectedRoute.jsx  # Protected route wrapper
│   │   │   └── Routes.jsx          # Main routing configuration
│   │   │
│   │   ├── styles/            # Global styles
│   │   │   ├── Header.css
│   │   │   ├── LandingPage.css
│   │   │   ├── LoginRegistration.css
│   │   │   ├── newQuestionButton.css
│   │   │   ├── QuestionPage.css
│   │   │   ├── RightBar.css
│   │   │   ├── Sidebar.css
│   │   │   └── variables.css       # CSS variables
│   │   │
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── index.ts
│   │   │
│   │   ├── App.jsx            # Main App component
│   │   ├── App.css            # App styles
│   │   ├── main.jsx           # Application entry point
│   │   └── index.css          # Global CSS
│   │
│   ├── .gitignore
│   ├── eslint.config.js       # ESLint configuration
│   ├── index.html             # HTML template
│   ├── package.json           # npm dependencies and scripts
│   ├── package-lock.json
│   ├── vite.config.js         # Vite configuration
│   └── README.md
│
└── README.md                  # Main project documentation
```

## 👥 Development

### Development Workflow
- **Test-Driven Development (TDD)**: Write tests before implementing features
- **Git Flow**: Feature branches from `develop`, merge via pull requests
- **Sprint-based development**: 2-week sprints with clear deliverables
- **Code reviews**: Required before merging to `main`

### Running Tests

**Backend Tests:**
```bash
cd backend
source venv/bin/activate
pytest                          # Run all tests
pytest test/unit/              # Run unit tests only
pytest test/integration/        # Run integration tests only
pytest -v                       # Verbose output
pytest --cov                    # With coverage report
pytest --cov=. --cov-report=html  # Generate HTML coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm test                        # Run tests (when configured)
npm run lint                    # Run ESLint
```

### Code Quality

**Backend:**
- Python code follows PEP 8 standards
- Pylint for static code analysis
- pytest for testing with fixtures and mocks
- HTML sanitization using bleach library for XSS prevention
- Password hashing using bcrypt
- JWT tokens for stateless authentication

**Frontend:**
- ESLint for JavaScript/TypeScript linting
- Component-based architecture
- TypeScript type definitions for type safety
- Protected routes for authentication
- React Hooks for state management

### Key Features Implementation

**Application Initialization:**
The Flask app uses the Application Factory pattern in `app.py`:
1. `create_app()` function initializes Flask app
2. Loads configuration from `config_postgres.py` using dotenv
3. Initializes SQLAlchemy with `db.init_app(app)`
4. Configures CORS for frontend origins
5. Registers all blueprint routes with URL prefixes
6. Creates database tables with `db.create_all()`
7. Seeds initial tags from `data/tags.json` if database is empty

**Authentication Flow:**
1. User registers via `POST /api/auth/register` (registration_routes.py)
2. Password hashed with bcrypt before storage
3. User logs in via `POST /api/auth/login` (login_routes.py)
4. JWT token generated using PyJWT and returned to client
5. Token stored in localStorage/sessionStorage on frontend
6. `auth_middleware.py` validates JWT tokens on protected routes
7. `ProtectedRoute.jsx` handles frontend route protection
8. `useAuth.jsx` hook manages authentication state in React

**Question Management:**
1. Questions created via `CreateQuestion.jsx` with React Quill editor
2. API request to `POST /api/questions` (question_routes.py)
3. Data sanitized via `html_sanitizer.py` using bleach
4. Stored in PostgreSQL database via `question.py` model
5. Tags associated through `questiontag.py` association table
6. Displayed with `QuestionTile.jsx` and `QuestionDetail.jsx`
7. Code snippets rendered with React Syntax Highlighter

**Database Models:**
- All models inherit from `base_model.py` which provides common CRUD methods
- Relationships defined using SQLAlchemy ORM
- Automatic timestamp management for created_at/updated_at fields

**Search:**
- Fuzzy search implemented in `fuzzy_search.py`
- Handles typos and partial matches
- Searches across questions, tags, and content

## 🤝 Contributing

1. **Create a feature branch from `develop`:**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. **Make your changes** following our coding standards

3. **Write/update tests** as needed

4. **Run tests locally** to ensure they pass

5. **Commit with clear, descriptive messages:**
```bash
git commit -m "feat: add fuzzy search to question filtering"
```

6. **Push to your branch** and create a merge request

7. **Ensure CI pipeline passes**

8. **Request code review** from at least one team member

### Commit Message Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code refactoring
- `style:` Code style changes (formatting, etc.)
- `chore:` Maintenance tasks

## 📄 License

This project is developed as part of Dalhousie University's CSCI-5308 Software Engineering course. All rights reserved.

## 🗺️ Roadmap

### Current Sprint (Sprint 3)
- ✅ Question creation with validation
- ✅ User authentication system with JWT
- ✅ Protected routes implementation
- ✅ Fuzzy search functionality
- ✅ Tag system with seeding
- ✅ HTML sanitization for XSS protection
- ✅ Rich text editor for questions
- ✅ Syntax highlighting for code snippets
- 🚧 Answer and comment functionality
- 🚧 Voting system
- 🚧 Notification system

### Upcoming Features
- User profile pages with activity history
- Advanced search with filters
- Email notifications
- Reputation system
- Markdown support for questions/answers
- Real-time updates via WebSockets
- Mobile responsive design improvements

## 🔒 Security Notes

- **Database Credentials**: The shared database credentials are for development purposes only
- **Environment Variables**: Use `.env` file for sensitive data (never commit to git)
- **XSS Protection**: All user input is sanitized via `html_sanitizer.py` using bleach
- **Password Security**: Passwords hashed with bcrypt before storage
- **Authentication**: JWT tokens for stateless authentication
- **CORS**: Configured to accept requests only from specified frontend origins
- **SQL Injection Prevention**: SQLAlchemy ORM provides parameterized queries

## 🚀 Deployment

### Production Deployment Considerations

**Backend Deployment:**

1. **Environment Variables for Production**
```env
# Use secure, randomly generated keys
SECRET_KEY=<generate-strong-random-key>

# Production database URL
DB_URL=postgresql://prod_user:secure_password@production-db-host:5432/daloverflow

# Disable debug mode
FLASK_ENV=production
FLASK_DEBUG=0

# Set allowed origins
ALLOWED_ORIGINS=https://daloverflow.dal.ca
```

2. **Production WSGI Server**
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

3. **Database Migration**
```bash
# Ensure all tables are created
python -c "from app import create_app; from database import db; app = create_app(); app.app_context().push(); db.create_all()"
```

**Frontend Deployment:**

1. **Build for Production**
```bash
cd frontend
npm run build
```
This creates an optimized production build in the `dist/` directory.

2. **Deploy Static Files**
The `dist/` folder can be deployed to:
- **AWS S3** + CloudFront
- **Netlify**
- **Vercel**
- **GitHub Pages**
- Traditional web server (Nginx, Apache)

3. **Environment Configuration**
Update API endpoint in production:
```javascript
// In frontend config
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.daloverflow.dal.ca/api'
  : 'http://localhost:5001/api';
```

**AWS EC2 Deployment Example:**

```bash
# 1. SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv nginx nodejs npm postgresql-client

# 3. Clone repository
git clone https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02.git
cd group02

# 4. Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# 5. Setup environment variables
nano .env  # Add production credentials

# 6. Build frontend
cd ../frontend
npm install
npm run build

# 7. Configure Nginx
sudo nano /etc/nginx/sites-available/daloverflow
```

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name daloverflow.dal.ca;

    # Frontend - serve static files
    location / {
        root /home/ubuntu/group02/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API - proxy to Flask
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Process Management with systemd:**

Create `/etc/systemd/system/daloverflow.service`:
```ini
[Unit]
Description=Dal Overflow Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/group02/backend
Environment="PATH=/home/ubuntu/group02/backend/venv/bin"
ExecStart=/home/ubuntu/group02/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5001 app:app

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable daloverflow
sudo systemctl start daloverflow
sudo systemctl status daloverflow
```

### Security Checklist for Production

- [ ] Change all default credentials
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS with SSL certificate (Let's Encrypt)
- [ ] Set up firewall rules (allow only 80, 443, SSH)
- [ ] Enable database connection encryption
- [ ] Set up regular database backups
- [ ] Configure CORS for production domain only
- [ ] Implement rate limiting
- [ ] Enable logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Disable Flask debug mode
- [ ] Use strong SECRET_KEY
- [ ] Set secure cookie flags (httponly, secure)

### CI/CD Pipeline (Future Enhancement)

Consider setting up automated deployment with GitLab CI/CD:

`.gitlab-ci.yml` example:
```yaml
stages:
  - test
  - build
  - deploy

test-backend:
  stage: test
  script:
    - cd backend
    - pip install -r requirements.txt
    - pytest

test-frontend:
  stage: test
  script:
    - cd frontend
    - npm install
    - npm run lint

build-frontend:
  stage: build
  script:
    - cd frontend
    - npm install
    - npm run build
  artifacts:
    paths:
      - frontend/dist/

deploy-production:
  stage: deploy
  only:
    - main
  script:
    - echo "Deploy to production server"
    # Add deployment commands here
```

## 🐛 Troubleshooting

**Backend won't start:**
- Ensure virtual environment is activated: `source venv/bin/activate`
- Check `.env` file exists with correct database credentials
- Verify PostgreSQL database is accessible: `psql -h csci5308-vm2.research.cs.dal.ca -U student -d daloverflow`

**Database connection errors:**
- Verify you're on campus network or connected to VPN
- Check database credentials in `.env` file
- Ensure database server is running

**Frontend can't connect to backend:**
- Verify backend is running on port 5001
- Check CORS configuration in `app.py`
- Ensure frontend is making requests to correct URL (http://localhost:5001/api)

**Port 5001 already in use:**
```bash
# Find process using port 5001
lsof -i :5001
# Kill the process
kill -9 <PID>
```

**npm install errors:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json, then reinstall
- Ensure Node.js version is 16 or higher

---

**Course:** CSCI-5308 - Software Engineering  
**Semester:** Fall 2025  
**Institution:** Dalhousie University  
**Project Start Date:** September 2024  
**Database Server:** csci5308-vm2.research.cs.dal.ca  
**Backend Port:** 5001  
**Frontend Port:** 5173