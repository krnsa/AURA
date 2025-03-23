import http from "node:http";
import { handleRequest } from "./src/router.js";

const server = http.createServer(handleRequest);

server.listen(5000, "localhost", () => {
  console.log("Backend server running at http://localhost:5000/");
});
