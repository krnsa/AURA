import "dotenv/config";
import Busboy from "busboy";

export function getAllowedOrigin(origin, devOrigins, prodOrigins) {
  const MODE = process.env.NODE_ENV || "development";
  const whitelist = MODE !== "production" ? devOrigins : prodOrigins;
  return whitelist.includes(origin) ? origin : null;
}

export function parseBody(req) {
  // Check if the request is multipart/form-data
  const contentType = req.headers["content-type"] || "";
  
  if (contentType.includes("multipart/form-data")) {
    return parseMultipartForm(req);
  }
  
  // Original JSON parsing logic
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

function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const formData = {};
    
    const busboy = Busboy({ headers: req.headers });
    
    // Handle regular form fields
    busboy.on("field", (fieldname, val) => {
      // Try to parse the value as JSON if it looks like an object/array
      try {
        if ((val.startsWith('{') && val.endsWith('}')) || 
            (val.startsWith('[') && val.endsWith(']'))) {
          formData[fieldname] = JSON.parse(val);
        } else {
          formData[fieldname] = val;
        }
      } catch (e) {
        // If parsing fails, just use the string value
        formData[fieldname] = val;
      }
    });
    
    // Handle file uploads
    busboy.on("file", (fieldname, fileStream, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];
      
      fileStream.on("data", (chunk) => {
        chunks.push(chunk);
      });
      
      fileStream.on("end", () => {
        if (chunks.length > 0) {
          // Store file data with metadata
          formData[fieldname] = {
            filename,
            mimeType,
            encoding,
            buffer: Buffer.concat(chunks)
          };
        }
      });
    });
    
    busboy.on("finish", () => {
      resolve(formData);
    });
    
    busboy.on("error", (err) => {
      reject(err);
    });
    
    // Pipe request to busboy for processing
    req.pipe(busboy);
  });
}

export function send(res, statusCode, payload, ContentType) {
  if (!ContentType) {
    ContentType = typeof payload === "object" ? "application/json" : "text/plain";
  }
  res.writeHead(statusCode, { "Content-Type": ContentType });
  res.end(typeof payload === "object" ? JSON.stringify(payload) : payload);
}