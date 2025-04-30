import { getAllowedOrigin, parseBody, send } from "./utils/utils.js";
import { registerUser, loginUser, requireAuth } from "./auth/auth.js";
import { routes } from "./routes.js";

// -------------------------- CORS Configuration --------------------------
const devOrigins = ["http://localhost:3000"];
const prodOrigins = ["https://auraplatform.vercel.app"];
const allowedMethods = "GET, POST, PUT, DELETE, OPTIONS";
const allowedHeaders = "Content-Type, Authorization";

// -------------------------- Request Handler --------------------------

export async function handleRequest(req, res) {
  // -------------------------- Initialization --------------------------

  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin, devOrigins, prodOrigins);

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
  // decodedData = {username, role}
  const decodedData = authResult.data;

  // -------------------------- Protected Routes --------------------------

  const routeKey = `${req.method} ${req.url.split("?")[0]}`;
  if (routes[routeKey]) {
    await routes[routeKey](req, res, decodedData);
    return;
  }

  // -------------------------- Fallback: 404 Not Found --------------------------
  send(res, 404, { success: false, message: "Not Found" });
}
