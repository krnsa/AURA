import { registerUser, loginUser, requireAuth } from "./auth/auth.js";
import findUser from "./api/findUser.js";
import newPost from "./implementations/newPost.js";
import getPosts from "./api/getPosts.js";
import getPostByID from "./api/getPostByID.js";
import removePost from "./implementations/removePost.js";
import getNotifications from "./api/getNotifications.js";


export async function handleRequest(req, res) {
  // -------------------------- Initialization --------------------------

  // Set common response headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request for CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204); // No content code
    res.end();
    return;
  }

  // -------------------------- Public Routes --------------------------

  // Register route
  if (req.url === "/api/register" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { username, password } = JSON.parse(body);
      const result = await registerUser(username, password);
      res.writeHead(result.error ? 400 : 200);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // Login route
  if (req.url === "/api/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { username, password } = JSON.parse(body);
      const result = await loginUser(username, password);
      res.writeHead(result.error ? 401 : 200);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // -------------------------- Authentication Check --------------------------

  // Check for authorization header
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: "Missing token" }));
    return;
  }

  const token = authHeader.split(" ")[1];
  const authResult = requireAuth(token);

  if (authResult.error) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: "Invalid or expired token." }));
    return;
  }
  // user information is decoded and can be used in the routes below
  const decodedData = authResult.data;
  const username = decodedData.username;

  // -------------------------- Protected Routes --------------------------

  // Home route (authenticated user welcome message)
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        success: true,
        message: `Welcome back, ${username}!`,
        user: { username },
      })
    );
    return;
  }

  // getPosts route
  // takes in a body with either a user_id or null, null returns all
  if (req.url === "/api/getPosts" && req.method === "GET") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { user_id } = JSON.parse(body);
      const result = await getPosts(user_id);
      res.writeHead(result.error ? 400 : 200);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // getPostsByID route
  if (req.url === "/api/getPostByID" && req.method === "GET") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { post_id } = JSON.parse(body);
      const result = await getPostByID(post_id);
      res.writeHead(result.error ? 400 : 200);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // findUser route
  // takes in username returns user_id
  if (req.url === "/api/findUser" && req.method === "GET") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { username } = JSON.parse(body);
      const result = await findUser(username);
      res.writeHead(result.error ? 400 : 200);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // removePost route
  if (req.url === "/api/removePost" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { user_id, post_id } = JSON.parse(body);
      const result = await removePost(user_id, post_id);
      res.writeHead(result.error ? 400 : 200);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // newPost route
  if (req.url === "/api/newPost" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      const { user_id, post_body, post_file } = JSON.parse(body);
      const result = await newPost(user_id, post_body, post_file);
      res.writeHead(result.error ? 400 : 200);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // getNotifications route
    
    if (req.url === "/api/notifications" && req.method === "GET") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        const result = await getNotifications(username);
        res.writeHead(result.error ? 400 : 200);
        res.end(JSON.stringify(result));
      });
      return;
    }

  
  // Fallback: 404 Not Found
  res.writeHead(404);
  res.end(JSON.stringify({ success: false, message: "Not Found" }));
}
