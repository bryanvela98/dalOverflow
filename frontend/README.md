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

# Run tests
npm run test
```

The development server will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # Reusable React components
│   ├── Header/       # Header component with search
│   ├── Question/     # Question-related components
│   ├── Tags/         # Tag-related components
│   └── ...           # Other components
├── pages/            # Page components
│   ├── LandingPage.jsx
│   ├── LoginRegistration.jsx
│   ├── ProfilePage.jsx
│   ├── SearchResults.jsx
│   ├── TagDetail.jsx
│   ├── CategoriesPage.jsx
│   └── UsersPage.jsx
├── services/         # API service calls
├── hooks/            # Custom React hooks
├── routes/           # Route definitions
├── styles/           # CSS styles
├── types/            # TypeScript types
├── constants/        # Constants
├── utils/            # Utility functions
├── test/             # Test files
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Key Features

- **Question Management** - Browse, search, and view questions with vote counts
- **Authentication** - User login and registration
- **User Profiles** - View user profiles with reputation calculated from votes
- **Tags** - Filter questions by tags
- **Search** - Full-text search across questions
- **Notifications** - Real-time notifications for users
- **Responsive Design** - Mobile-friendly UI

## API Integration

The frontend communicates with the backend API at `http://localhost:5001/api/`. Key endpoints used:

- **Questions** - Fetch all questions, get specific questions
- **Votes** - Get vote counts for questions and calculate reputation
- **Users** - Fetch user data and profiles
- **Tags** - Get available tags and filter by tags
- **Answers** - Fetch and display answers
- **Notifications** - Fetch user notifications
- **Search** - Full-text search functionality

## Development

```bash
# Run development server with HMR
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Technologies

- **React** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios/Fetch** - HTTP requests (uses native Fetch API)
- **CSS** - Styling

## Environment Variables

Create a `.env` file in the frontend root:

```
VITE_API_BASE_URL=http://localhost:5001/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
