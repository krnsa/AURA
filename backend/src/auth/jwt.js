import crypto from "crypto";

// Simple function to create token header and payload, then sign it
export function createToken(payload, secret) {
  // Create header
  const header = { alg: "HS256", typ: "JWT" };
  // Convert to Base64
  const base64Header = toBase64Url(JSON.stringify(header));
  const base64Payload = toBase64Url(JSON.stringify(payload));
  const msg = base64Header + "." + base64Payload;

  // Sign with HMAC-SHA256
  const signature = sign(msg, secret);

  return msg + "." + signature;
}

// Verify token
export function verifyToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerSeg, payloadSeg, signatureSeg] = parts;
  const msg = headerSeg + "." + payloadSeg;
  const newSig = sign(msg, secret);
  if (newSig !== signatureSeg) return null;

  const payload = JSON.parse(fromBase64Url(payloadSeg));
  return payload;
}

// Internal small helpers
function sign(msg, secret) {
  return crypto.createHmac("sha256", secret).update(msg).digest("base64url");
}

function toBase64Url(str) {
  return Buffer.from(str).toString("base64url");
}

function fromBase64Url(str) {
  return Buffer.from(str, "base64url").toString();
}
