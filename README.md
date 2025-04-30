# AURA

A Social Media Platform with Integrated E-Commerce  
**Live Demo:** [AURA](https://auraplatform.vercel.app/)

## Tech Stack Overview

- **Frontend:** Vanilla HTML/CSS/JS with ES Modules (MPA)
  - Multi‑Page Architecture (`index.html`, `profile.html`, `shop.html`, etc.)
  - Modular JavaScript (`index.js`, `profile.js`, etc.)
  - Fetch API for backend communication
  - Hot‑reload support using WebSocket (`frontend-server.js`)
- **Backend:** Node.js + Supabase
  - REST API (`/api/register`, `/api/login`)
  - Supabase for database, authentication, and storage
  - JWT‑based authentication (custom implementation with `jsonwebtoken`)
- **Architecture:** Monorepo (`frontend/` + `backend/`) managed via npm workspaces
- **Database & Storage:** Supabase (PostgreSQL + Storage)

## Detailed Architecture

- **Monorepo Management**

  - Root `package.json` uses npm workspaces to install and manage frontend & backend dependencies.
  - Development script (`npm run dev`) uses `concurrently` to launch both servers in parallel.

- **Backend (Node.js + Supabase)**

  - Native HTTP server using Node.js core `http` module (`server.js` entry point).
  - Declarative routing in `routes.js`, dispatched by `handleRequest`.
  - Supabase client (`@supabase/supabase-js`) for database and storage operations.
  - JWT authentication via `jsonwebtoken` (utilities in `auth/`).
  - Body parsing & multipart/form-data uploads using `busboy` with a unified `parseBody` (`backend/src/utils/utils.js`).
  - Hot reload in development powered by `nodemon` (configured in `nodemon.json`).

- **Frontend (Vanilla HTML/CSS/JS + ES Modules)**

  - Multi‑Page Application (MPA): standalone pages in `frontend/` (`index.html`, `profile.html`, `shop.html`, etc.).
  - Modular JavaScript modules under `frontend/js` (e.g., `global.js`, `profile.js`, `messages.js`).
  - Centralized styling in `frontend/css/styles.css`; component styles under `frontend/css/components`.
  - Live‑reload server `frontend-server.js` using `chokidar` + `WebSocket` for automatic page refresh.
  - All API calls via Fetch API, base URL managed by `window.CONFIG.API_URL`.

- **Deployment & Tools**
  - Frontend deployed to Vercel (static hosting).
  - Backend deployable on any Node.js‑compatible host (Railway, Heroku, etc.).
  - Environment variables loaded from `.env` (`SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`).
  - Documentation maintained in `docs/overview.md`, `docs/frontend.md`, and `docs/backend.md`.

## Backend Strengths

1. **Centralized CORS Handling**  
   All CORS headers and allowed origins are configured in one place within `handleRequest`, with early return on OPTIONS requests.

2. **Decoupled Declarative Routing**  
   Endpoints are defined in a single route map in `routes.js`, eliminating sprawling `if/else` chains when adding or removing routes.

## Features

### Frontend

- **Dynamic Pages:**
  - `profile.html` dynamically loads user details and posts.
  - `shop.html` and `messages.html` provide interactive user experiences.
- **Authentication:** Login and registration pages with form validation.
- **Global Styling:** Centralized CSS in `frontend/css/styles.css`.
- **Hot Reload:** Automatic page reload on file changes during development.

### Backend

- **User Management:** Register and login with JWT authentication.
- **Post Management:** Create, fetch, and delete posts.
- **Notifications:** Fetch and display user notifications.
- **Supabase Integration:** Database operations and file uploads handled via Supabase JS.

## Getting Started

### Prerequisites

- Node.js (v16+)
- Supabase account with configured database and storage
- Git for version control

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/krnsa/AURA.git
   cd AURA
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the `backend/` directory with:
     ```
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

### Scripts

- **Start Backend:** `npm run start:backend` (production mode)
- **Develop Backend:** `npm run dev:backend` (with `nodemon` hot reload)
- **Start Frontend:** `npm run start:frontend`
- **Development Mode:** `npm run dev` (concurrently starts both frontend & backend)

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

The frontend is deployed to Vercel or any static hosting service.

- Ensure the `frontend/` directory is set as the root for deployment.

### Backend

Deploy the backend to any Node.js‑compatible hosting platform (Railway, Heroku, etc.).

#### Environment Variables

Ensure the following environment variables are set during deployment:

- `NODE_ENV=production`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_KEY=your_supabase_key`
- `JWT_SECRET=your_jwt_secret`
- `CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name`
- `CLOUDINARY_API_KEY=your_cloudinary_api_key`
- `CLOUDINARY_API_SECRET=your_cloudinary_api_secret`

These Cloudinary variables are used for managing media uploads and storage. Replace `your_cloudinary_*` with the actual values from your Cloudinary account.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
