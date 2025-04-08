# Backend (Node.js + Supabase)

## **Technologies Used**

- **Supabase** – Managed PostgreSQL database with authentication and storage.
- **ES Modules (`import/export`)** – Modern JavaScript module system.
- **dotenv** – Loads environment variables from `.env` file.
- **REST API** – Standardized endpoints (`/api/users`, `/api/posts`).
- **Monorepo** – Backend code in `backend/` managed via `npm workspaces`.

## **Implemented Features**

- `/api/users` – User management API.
- `/api/posts` – Post management API.

## **Installed Packages**

Please run these commands in the `backend/` directory to install the required packages.

```bash
npm install dotenv
npm install @supabase/supabase-js
npm install @supabase/jsonwebtoken
npm install --save-dev nodemon
```
