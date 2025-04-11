# Backend (Node.js + Supabase)

## **Technologies Used**

- **Supabase** – Managed PostgreSQL database with authentication and storage.
- **ES Modules (`import/export`)** – Modern JavaScript module system.
- **dotenv** – Loads environment variables from `.env` file.
- **jsonwebtoken** – Custom JWT-based authentication implementation.
- **REST API** – Standardized endpoints (`/api/register`, `/api/login`, etc.).
- **Monorepo** – Backend code in `backend/` managed via `npm workspaces`.

## **Implemented Features**

- **Authentication:** Register and login functionality with JWT-based authentication.
- **Post Management:** Create, fetch, and delete posts.
- **Notifications:** Fetch and display user notifications.
- **Supabase Integration:** Handles database operations and file uploads.

## **Installed Packages**

Please run these commands in the `backend/` directory to install the required packages.

```bash
npm install dotenv
npm install @supabase/supabase-js
npm install jsonwebtoken
npm install --save-dev nodemon
```
