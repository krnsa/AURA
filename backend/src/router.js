import { testDatabase } from "./dev/testSupabase.js"; // Test database function
// import findUser from "./api/findUser.js";
// import newPost from "./implementations/newPost.js";
// import getPosts from "./api/getPosts.js";
// import deletePost from "./api/deletePost.js";
// import getPostByID from "./api/getPostByID.js";
// import removePost from "./implementations/removePost.js";

export async function handleRequest(req, res) {
  // Set common response headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request for CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204); // No content
    res.end();
    return;
  }

  // Home route
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, message: "Welcome to the API" }));
    return;
  }

  // Test API route
  if (req.url === "/api/test" && req.method === "GET") {
    try {
      const data = await testDatabase();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data }));
    } catch (err) {
      console.error("Database error:", err);
      res.writeHead(500);
      res.end(
        JSON.stringify({
          success: false,
          error: err.message || "Internal Server Error",
        })
      );
    }
    return;
  }

  // Fallback: 404 Not Found
  res.writeHead(404);
  res.end(JSON.stringify({ success: false, message: "Not Found", data: null }));
}
