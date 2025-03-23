import http from "node:http";
import fs from "fs";
import path from "path";

// import test api route
import testDatabase from "./src/dev/test.js";
import findUserID from "./src/api/findUser.js";
import newPost from "./src/implementations/newPost.js";
import getPosts from "./src/api/getPosts.js";
import deletePost from "./src/api/deletePost.js";
import getPostByID from "./src/api/getPostByID.js";
import removePost from "./src/implementations/removePost.js";

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
server.listen(5000, "localhost", () => {
  console.log(`Server running at http://localhost:5000/`);
});

//createPost(1, "test");

// const filePath = path.resolve("./img/test.jpg");
// const fileBuffer = fs.readFileSync(filePath);

// Create a Blob (Supabase accepts Blobs like Files)
// const file = new File([fileBuffer], "test-image.jpg", { type: "image/jpeg" });

// await newPost(3, "test 3");

// console.log(findUserID("sam.mulvey747"));

// let data = await getPosts(3);

// console.log(data.length);

//console.log(await removePost(3, 10));
