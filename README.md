# AURA

A Social Media Platform with Integrated E-Commerce  
**Live Demo:** [AURA](https://auraplatform.vercel.app/)

## Tech Stack Overview

- **Frontend:** Vanilla HTML/CSS/JS with ES Modules (MPA)
  - Multi-Page Architecture (`index.html`, `profile.html`, `shop.html`, etc.)
  - Modular JavaScript (`index.js`, `profile.js`, etc.)
  - Fetch API for backend communication
  - Hot-reload support using WebSocket (`frontend-server.js`)
- **Backend:** Node.js + Supabase
  - REST API (`/api/register`, `/api/login`)
  - Supabase for database, authentication, and storage
  - JWT-based authentication (custom implementation using `jsonwebtoken` library)
- **Architecture:** Monorepo (`frontend/` + `backend/`)
- **Database:** Supabase (PostgreSQL + Auth + Storage)

## Features

### Frontend

- **Dynamic Pages:**
  - `profile.html` dynamically loads user details and posts.
  - `shop.html` and `messages.html` provide interactive user experiences.
- **Authentication:** Login and registration pages with validation.
- **Global Styling:** Centralized CSS in `frontend/css/styles.css`.
- **Hot Reload:** Automatic page reload on file changes during development.

### Backend

- **User Management:** Register and login functionality with JWT authentication.
- **Post Management:** Create, fetch, and delete posts.
- **Notifications:** Fetch and display user notifications.
- **Supabase Integration:** Handles database operations and file uploads.

## Getting Started

### Prerequisites

- Node.js (v16+)
- Supabase account with configured database and storage
- Git for version control

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/krnsa/AURA.git
   cd aura
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the `backend/` directory with the following:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     JWT_SECRET=your_jwt_secret
     ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

### Scripts

- **Start Backend:** `npm run start:backend` (starts the backend server without hot reload)
- **Development Mode (Backend):** `npm run dev:backend` (starts the backend server with hot reload using `nodemon`)
- **Start Frontend:** `npm run start:frontend`
- **Development Mode:** `npm run dev` (concurrently starts both frontend and backend)

## Folder Structure

```
AURA/
├── backend/               # Backend code
│   ├── src/               # Source files
│   ├── .env               # Environment variables
│   ├── server.js          # Backend entry point
│   └── package.json       # Backend dependencies
├── frontend/              # Frontend code
│   ├── css/               # CSS files
│   ├── js/                # JavaScript files
│   ├── index.html         # Main entry point
│   └── package.json       # Frontend dependencies
├── docs/                  # Documentation
├── package.json           # Root dependencies and scripts
└── README.md              # Project documentation
```

## Deployment

### Frontend

The frontend is deployed to Vercel.

### Backend

The backend can be deployed to any Node.js-compatible hosting platform (e.g., Railway, Heroku).

#### Environment Variables

Ensure the following environment variables are set during deployment:

- `NODE_ENV=production`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_KEY=your_supabase_key`
- `JWT_SECRET=your_jwt_secret`

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
