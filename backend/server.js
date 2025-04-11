import "dotenv/config";
import http from "node:http";
import { handleRequest } from "./src/router.js";

const MODE = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 5000;
const HOSTNAME = process.env.HOSTNAME || "localhost";

const server = http.createServer(handleRequest);

server.on("error", (err) => {
  console.error("Server error:", err);
});

server.listen(PORT, () => {
  if (MODE === "development") {
    console.log(
      `\x1b[36m%s\x1b[0m`,
      `Backend server running at http://${HOSTNAME}:${PORT}/ (${MODE} mode)\n`
    );
  } else {
    console.log(`\x1b[36m%s\x1b[0m`, `Backend server running on port ${PORT} (${MODE} mode)\n`);
  }
});
