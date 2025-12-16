# Frontend

React + Vite frontend for DalOverflow.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

The development server will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Header/         # Navigation and search
│   ├── Question/       # Question display and editing
│   ├── NotificationBell/ # User notifications
│   ├── Tags/           # Tag components
│   └── ...             # Other UI components
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── ProfilePage.jsx
│   ├── SearchResults.jsx
│   └── ...             # Other pages
├── hooks/              # Custom React hooks
├── routes/             # Route definitions
├── styles/             # CSS styling
├── constants/          # Configuration constants
├── utils/              # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Key Features

- **Question Management** - Browse, search, and view questions with vote counts and view tracking
- **Authentication** - User login, registration, and logout with session validation
- **User Profiles** - View and edit user profiles with reputation calculated from votes
- **Tags** - Filter and browse questions by tags
- **Search** - Full-text fuzzy search across questions
- **Voting System** - Upvote and downvote questions and answers with persistent state
- **Comments** - Add and view comments on answers
- **Notifications** - Real-time user notifications with mark-as-read functionality
- **AI Features** - AI-powered answer generation and summarization
- **Question Editing** - Edit questions with history tracking and permissions
- **Responsive Design** - Mobile-friendly UI with consistent styling

## Development

```bash
# Run development server with HMR
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Technologies

- **React 18** - UI library for building components
- **Vite** - Modern build tool and development server with instant HMR
- **React Router** - Client-side routing and navigation
- **Fetch API** - HTTP requests to backend API
- **CSS3** - Styling with CSS variables and flexbox/grid layouts

## Design System

The frontend uses a consistent design system with:

- **Color Theme** - Primary yellow (#FFC107) with supporting colors for success, danger, and neutral states
- **Typography** - System font stack with consistent sizing scale
- **Spacing** - Standardized spacing variables for consistent layout
- **Components** - Reusable components following React best practices

## Environment Variables

Create a `.env` file in the frontend root directory:

```
VITE_API_BASE_URL=http://localhost:5001/api
```

## Testing

Tests are organized by type:

- **Unit Tests** - Test individual components and utilities
- **Integration Tests** - Test component interactions and API integration

Create a `.env` file in the frontend root:

```
VITE_API_BASE_URL=http://localhost:5001/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
