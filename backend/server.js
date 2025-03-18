// Suppress deprecation warnings (Temporary solution)
// The `punycode` module is deprecated
process.noDeprecation = true;

// import http module
import http from "node:http";

// import test api route
import testDatabase from "./src/routes/test.js";
import findUserID from "./src/routes/findUser.js";

import newPost from "./src/implementations/newPost.js"

import fs from "fs";
import path from "path";
import { Blob } from "buffer";

const hostname = "localhost";
const PORT = 5000;

const server = http.createServer((req, res) => {
  // Set response headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Preflight request
  if (req.method === "OPTIONS") {
    res.writeHead(204); // No content code
    res.end();
    return;
  }

  // Home route
  if (req.url === "/" && req.method === "GET") {
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, message: "Welcome to the API" }));
    return;
  }

  // Test API route
  if (req.url === "/api/test" && req.method === "GET") {
    testDatabase()
      .then((data) => {
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, data }));
      })
      .catch((err) => {
        console.error("Database error:", err);
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            success: false,
            error: err.message || "Internal Server Error",
            data: null,
          })
        );
      });
    return;
  }

  // 404 Not Found (if no route matches)
  res.statusCode = 404;
  res.end(JSON.stringify({ success: false, message: "Not Found", data: null }));
});

// Start server
server.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
  console.log(`Testing database at http://${hostname}:${PORT}/api/test`);
});

//createPost(1, "test");

const filePath = path.resolve("./test.jpg");
const fileBuffer = fs.readFileSync(filePath);

// Create a Blob (Supabase accepts Blobs like Files)
const file = new File([fileBuffer], "test-image.jpg", { type: "image/jpeg" });

const test = await newPost(1, "test 2", file);

console.log(findUserID("sam.mulvey747"));