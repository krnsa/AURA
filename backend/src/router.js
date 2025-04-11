import "dotenv/config";
import { registerUser, loginUser, requireAuth } from "./auth/auth.js";
import findUser from "./api/findUser.js";
import newPost from "./implementations/newPost.js";
import getPosts from "./api/getPosts.js";
import getPostByID from "./api/getPostByID.js";
import removePost from "./implementations/removePost.js";
//import getNotifications from "./api/getNotifications.js";

// -------------------------- CORS Configuration --------------------------
const devOrigins = ["http://localhost:3000"];
const prodOrigins = ["https://auraplatform.vercel.app"];
const allowedMethods = "GET, POST, PUT, DELETE, OPTIONS";
const allowedHeaders = "Content-Type, Authorization";

// -------------------------- Utility functions --------------------------

function getAllowedOrigin(origin) {
  const MODE = process.env.NODE_ENV || "development";
  const whitelist = MODE !== "production" ? devOrigins : prodOrigins;
  return whitelist.includes(origin) ? origin : null;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function send(res, statusCode, payload, ContentType) {
  if (!ContentType) {
    ContentType = typeof payload === "object" ? "application/json" : "text/plain";
  }
  res.writeHead(statusCode, { "Content-Type": ContentType });
  res.end(JSON.stringify(payload));
}

// -------------------------- Request Handler --------------------------

export async function handleRequest(req, res) {
  // -------------------------- Initialization --------------------------

  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin);

  // Set CORS headers for all responses
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }
  res.setHeader("Access-Control-Allow-Methods", allowedMethods);
  res.setHeader("Access-Control-Allow-Headers", allowedHeaders);
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight request for CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // -------------------------- Public Routes --------------------------

  // Register route
  if (req.url === "/api/register" && req.method === "POST") {
    const { username, password } = await parseBody(req);
    const result = await registerUser(username, password);
    send(res, result.error ? 400 : 200, result);
    return;
  }

  // Login route
  if (req.url === "/api/login" && req.method === "POST") {
    const { username, password } = await parseBody(req);
    const result = await loginUser(username, password);
    send(res, result.error ? 401 : 200, result);
    return;
  }

  // -------------------------- Authentication Check --------------------------

  // Check for authorization header
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    send(res, 401, { error: "Missing token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const authResult = requireAuth(token);
  if (authResult.error) {
    send(res, 401, { error: "Invalid or expired token." });
    return;
  }

  // user information is decoded and can be used in the routes below
  const decodedData = authResult.data;
  const username = decodedData.username;

  // -------------------------- Protected Routes --------------------------

  const routes = {
    // Home route (authenticated user welcome message)
    "GET /": async () => {
      send(res, 200, {
        success: true,
        message: `Welcome back, ${username}!`,
        user: { username },
      });
    },
    // getPosts route
    // takes in a body with either a user_id or null, null returns all
    "POST /api/getPosts": async () => {
      const { user_id } = await parseBody(req);
      const result = await getPosts(user_id);
      send(res, result.error ? 400 : 200, result);
    },
    // getPostsByID route
    "POST /api/getPostByID": async () => {
      const { post_id } = await parseBody(req);
      const result = await getPostByID(post_id);
      send(res, result.error ? 400 : 200, result);
    },
    // findUser route
    // takes in username returns user_id
    "POST /api/findUser": async () => {
      const { username } = await parseBody(req);
      const result = await findUser(username);
      send(res, result.error ? 400 : 200, result);
    },
    // newPost route
    "POST /api/newPost": async () => {
      const { user_id, post_body, post_file } = await parseBody(req);
      const result = await newPost(user_id, post_body, post_file);
      send(res, result.error ? 400 : 200, result);
    },
    // removePost route
    "POST /api/removePost": async () => {
      const { user_id, post_id } = await parseBody(req);
      const result = await removePost(user_id, post_id);
      send(res, result.error ? 400 : 200, result);
    },
    // getNotifications route
    // "GET /api/notifications": async () => {
    //   const result = await getNotifications(username);
    //   send(res, result.error ? 400 : 200, result);
    // },
  };

  const routeKey = `${req.method} ${req.url}`;
  if (routes[routeKey]) {
    await routes[routeKey]();
    return;
  }

  // -------------------------- Fallback: 404 Not Found --------------------------
  send(res, 404, { success: false, message: "Not Found" });
}
