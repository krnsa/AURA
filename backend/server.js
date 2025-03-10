// Suppress deprecation warnings (Temporary solution)
process.noDeprecation = true;

// environment variables
import "dotenv/config";

// import http module
import http from "node:http";

// import supabase client
import supabase from "./src/models/supabaseClient.js";

const hostname = "localhost";
const PORT = 5000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/api/test" && req.method === "GET") {
    testDatabase()
      .then((data) => {
        res.statusCode = 200;
        res.end(JSON.stringify(data));
      })
      .catch((err) => {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: "Not Found" }));
  }
});

async function testDatabase() {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      throw error;
    } else if (data.length === 0) {
      console.log("Supabase query succeeded but no data found.");
      return { message: "No data found" };
    } else {
      console.log(data, "Supabase query succeeded:");
      return data;
    }
  } catch (err) {
    console.error("Supabase query failed:", err.message);
    throw err;
  }
}

server.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});
