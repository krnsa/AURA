import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

// Create HTTP server
const server = http.createServer((req, res) => {
  const urlPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    } else {
      // Inject WebSocket client script for hot reload
      if (ext === ".html") {
        const injectedContent = content.toString().replace(
          "</body>",
          `<script>
              const ws = new WebSocket('ws://localhost:${PORT}');
              ws.onmessage = (message) => {
                if (message.data === 'reload') {
                  location.reload();
                }
              };
            </script></body>`
        );
        res.writeHead(200, { "Content-Type": mimeTypes[ext] });
        res.end(injectedContent);
      } else {
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
        res.end(content);
      }
    }
  });
});

// WebSocket server for hot reload
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected for hot reload");
});

// Watch for file changes using chokidar
chokidar.watch(__dirname).on("change", (filePath) => {
  console.log(`File changed: ${filePath}`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send("reload");
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});
