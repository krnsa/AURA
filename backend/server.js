// Suppress deprecation warnings (Temporary solution)
process.noDeprecation = true;

// environment variables
import "dotenv/config";

import http from "node:http";
import cors from "cors";
import supabase from "./models/supabaseClient.js";

const PORT = 5000;

const server = http.createServer((request, response) => {});

async function testDatabase() {
  try {
    const { data, error } = await supabase.from("users").select().limit(2);

    if (error) {
      throw error;
    } else if (data.length === 0) {
      console.log("⚠️ Supabase query succeeded but no data found.");
    } else {
      console.log(data, "✅ Supabase query succeeded:");
    }
  } catch (err) {
    console.error("❌ Supabase query failed:", err.message);
  }
}

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
