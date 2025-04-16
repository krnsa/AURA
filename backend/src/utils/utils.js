import "dotenv/config";

export function getAllowedOrigin(origin, devOrigins, prodOrigins) {
  const MODE = process.env.NODE_ENV || "development";
  const whitelist = MODE !== "production" ? devOrigins : prodOrigins;
  return whitelist.includes(origin) ? origin : null;
}

export function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export function send(res, statusCode, payload, ContentType) {
  if (!ContentType) {
    ContentType = typeof payload === "object" ? "application/json" : "text/plain";
  }
  res.writeHead(statusCode, { "Content-Type": ContentType });
  res.end(typeof payload === "object" ? JSON.stringify(payload) : payload);
}
