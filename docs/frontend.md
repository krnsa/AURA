# Frontend (Vanilla HTML/CSS/JS with ES Modules)

## **Technologies Used**

- **Multi-Page Architecture (MPA)** – Separate HTML pages (`index.html`, `profile.html`, `shop.html`, `messages.html`, etc.).
- **ES Modules (`import/export`)** – Modular JavaScript (`index.js`, `profile.js`, `shop.js`, etc.).
- **Fetch API** – Communicates with backend endpoints for dynamic data loading.
- **Global Styling** – Centralized CSS located at `css/styles.css`.
- **Hot Reload** – Enabled during development using WebSocket (`frontend-server.js`).

## **Implemented Features**

- `index.html` – Displays the main landing page with animations.
- `profile.html` – Dynamically loads user details, posts, and statistics.
- `shop.html` – Provides an interactive shopping experience.
- `messages.html` – Displays user conversations and chat functionality.
- `register.html` & `login.html` – Handles user authentication with form validation.

## **Installed Packages**

Please run these commands in the `frontend/` directory to install the required packages.

```bash
npm install chokidar
npm install ws
```
