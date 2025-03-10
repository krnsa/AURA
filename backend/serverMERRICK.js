// Suppress deprecation warnings (Temporary solution)
process.noDeprecation = true;

// Environment variables
import "dotenv/config";

import http from "node:http";
import cors from "cors";
import supabase from "./models/supabaseClient.js";

const PORT = 5000;
const HOSTNAME = "localhost";

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
    
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200);
        res.end(JSON.stringify({ message: "Server is running..." }));
    } else if (req.method === "GET" && req.url === "/test-db") {
        try {
            const { data, error } = await supabase.from("users").select().limit(2);
            
            if (error) {
                throw error;
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Query succeeded", data }));
        } catch (err) {
            console.error("❌ Supabase query failed:", err.message);
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Internal Server Error" }));
        }
    } else if (req.method === "POST" && req.url === "/register") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            try {
                const { email, password } = JSON.parse(body);
                const { user, error } = await supabase.auth.signUp({ email, password });
                
                if (error) {
                    throw error;
                }
                
                res.writeHead(201);
                res.end(JSON.stringify({ message: "User registered successfully", user }));
            } catch (err) {
                console.error("❌ Registration failed:", err.message);
                res.writeHead(400);
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else if (req.method === "POST" && req.url === "/login") {
        let body = "";
        req.on("data", chunk => { body += chunk.toString(); });
        req.on("end", async () => {
            try {
                const { email, password } = JSON.parse(body);
                const { user, session, error } = await supabase.auth.signInWithPassword({ email, password });
                
                if (error) {
                    throw error;
                }
                
                res.writeHead(200);
                res.end(JSON.stringify({ message: "Login successful", user, session }));
            } catch (err) {
                console.error("❌ Login failed:", err.message);
                res.writeHead(401);
                res.end(JSON.stringify({ error: "Invalid credentials" }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Not Found" }));
    }
});

server.listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
