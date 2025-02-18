### **Project Technology Stack & Architecture**  

This project follows a **modern monorepo structure** with a **multi-page architecture (MPA)**, built using **Supabase + Express.js (backend) and vanilla ES Modules (frontend)**.  

## **Backend (Node.js + Express.js + Supabase)**

### **Technologies Used**  
- **Express.js** – Lightweight web framework for handling API requests.  
- **Supabase** – Managed PostgreSQL database with authentication services.  
- **ES Modules (`import/export`)** – Modern JavaScript module system.  
- **dotenv** – Loads environment variables from `.env` file.  
- **CORS Middleware** – Enables frontend-to-backend requests.  
- **REST API** – Provides standardized endpoints (`/api/users`, `/api/posts`).  
- **Monorepo Structure** – Backend is housed in `backend/` and managed via `npm workspaces`.  

### **Implemented Features**  
- User management API (`/api/users`).  
- Post management API (`/api/posts`).  
- Supabase as the database (no need for manual setup).  
- Middleware for CORS & JSON body parsing.  
- ES Modules for modular code structure.  

## **Frontend (Vanilla HTML/CSS/JS with ES Modules)**  

### **Technologies Used**  
- **Multi-Page Architecture (MPA)** – Each page (`index.html`, `profile.html`, `post.html`) loads separately.  
- **ES Modules (`import/export`)** – Modular JavaScript structure (`home.js`, `profile.js`).  
- **Fetch API (`fetch()`)** – Used for backend communication.  
- **Shared API Utility (`api.js`)** – Centralized API request logic.  
- **URL Parameters (`URLSearchParams`)** – Enables dynamic routing (e.g., `profile.html?id=1`).  
- **Global Styling** – CSS is stored in `assets/css/styles.css`.  

### **Implemented Features**  
- **Home Page (`index.html`)** – Displays user list.  
- **Profile Page (`profile.html`)** – Loads user details dynamically.  
- **Post Page (`post.html`)** – Fetches individual posts.  
- **Dynamic Data Fetching** – Uses `api.js` to interact with backend.  
- **Navigation Handling** – Header links manage page transitions.  

## **Project Architecture Summary**  

### **Backend (Express.js + Supabase)**  
- Express.js server handling API requests.  
- Supabase as a managed database.  
- REST API structure with modular routes.  
- ES Modules for code maintainability.  

### **Frontend (Vanilla JS + ES Modules + MPA)**  
- Multi-Page Architecture (MPA) with separate pages.  
- ES Modules for modular JavaScript organization.  
- Fetch API for backend communication.  
- URL-based dynamic routing.  