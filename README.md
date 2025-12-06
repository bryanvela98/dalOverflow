# Dal Overflow

A Stack Overflow-like Q&A platform designed for Dalhousie University students and faculty. Built as part of CSCI 5308 Advanced Concepts in Software Development.

Live Application: https://frontend-five-roan-92.vercel.app/

## Project Overview

Dal Overflow enables the Dalhousie University community to ask questions, share knowledge, and collaborate on academic and technical topics through a comprehensive Q&A platform with user authentication, voting systems, and knowledge organization via tags.

## Dependencies

### Frontend

- React 18.3.1 - UI framework
- React Router DOM 7.9.4 - Client-side routing
- Vite 7.1.7 - Build tool and development server
- Axios 1.12.2 - HTTP client
- React Quill 2.0.0 - Rich text editor
- React Syntax Highlighter 16.1.0 - Code syntax highlighting
- bcryptjs 3.0.3 - Client-side cryptography utilities
- ESLint 9.36.0 - Code linting
- Vitest 4.0.14 - Testing framework
- Node.js v16 or higher
- npm v7 or higher

For complete list: [frontend/package.json](/frontend/package.json)

### Backend

- Flask 3.1.2 - Python web framework
- PostgreSQL 12 or higher - Relational database
- SQLAlchemy 2.0.44 - ORM for database operations
- Flask-SQLAlchemy 3.1.1 - Flask integration for SQLAlchemy
- Flask-CORS 6.0.1 - Cross-Origin Resource Sharing
- bcrypt 4.0.1 - Password hashing
- PyJWT 2.8.0 - JSON Web Token authentication
- psycopg2-binary 2.9.11 - PostgreSQL adapter
- pytest 8.4.2 - Testing framework
- pytest-cov 7.0.0 - Code coverage for tests
- python-dotenv 1.2.1 - Environment variable management
- bleach 6.2.0 - HTML sanitization
- google-genai 1.47.0 - Google Gemini AI API
- google-auth 2.43.0 - Google authentication
- beautifulsoup4 4.12.2 - HTML/XML parsing
- Python 3.8 or higher

For complete list: [backend/requirements.txt](/backend/requirements.txt)

## Setup Instructions

### macOS

#### Backend Setup

1. Clone the repository:

```bash
git clone https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02.git
cd group02/backend
```

2. Create and activate virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file:

```bash
cp .env.example .env
```

5. Configure environment variables in `.env`:

```
DB_URL=postgresql://student:Thah1eith8@csci5308-vm2.research.cs.dal.ca:5432/daloverflow
SECRET_KEY=your-secret-key-here
PORT=5001
```

6. Start backend server:

```bash
python app.py
```

Backend runs on `http://localhost:5001`

#### Frontend Setup

1. Navigate to frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### Windows

#### Backend Setup

1. Clone the repository:

```bash
git clone https://git.cs.dal.ca/courses/2025-Fall/csci-5308/group02.git
cd group02\backend
```

2. Create and activate virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file in backend directory:

```
DB_URL=postgresql://student:Thah1eith8@csci5308-vm2.research.cs.dal.ca:5432/daloverflow
SECRET_KEY=your-secret-key-here
PORT=5001
```

5. Start backend server:

```bash
python app.py
```

Backend runs on `http://localhost:5001`

#### Frontend Setup

1. Navigate to frontend directory:

```bash
cd ..\frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## Deployment Instructions
-[DEPLOYMENT.md](DEPLOYMENT.md)

## Usage Scenarios

For detailed usage scenarios and feature workflows, see:

- Frontend usage and component documentation: [/frontend/README.md](/frontend/README.md)
- Backend API documentation and endpoints: [/backend/README.md](/backend/README.md)
- Usage scenario documentation: [/docs/Usage-scenario.pdf](/docs/Usage-scenario.pdf)
- Code smells: [/docs/smells](/docs/smells)
- User flow diagrams: [/docs/Userflow-diagrams.pdf](/docs/Userflow-diagrams.pdf)
- Commit hashes for TDD approach: [docs/commit_hash-TDD.pdf](docs/commit_hash-TDD.pdf)
