import supabase from "../supabase/supabaseClient.js";

import { createToken, verifyToken } from "../auth/jwt.js";

const SECRET = "abcdefghijklmnop12345678901234567890";
const users = []; // simple array of { username, password }

export function registerUser(username, password) {
  // Check if user already exists
  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    return { error: "User already exists." };
  }
  // Add user
  users.push({ username, password });
  return { success: true, message: "Register success." };
}

export function loginUser(username, password) {
  // Check credentials
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return { error: "Invalid credentials." };
  }
  // Create JWT
  const token = createToken({ username }, SECRET);
  return { success: true, token };
}

// Optional: verify token if needed in other APIs
export function requireAuth(token) {
  const data = verifyToken(token, SECRET);
  if (!data) {
    return { error: "Token invalid." };
  }
  return { success: true, data };
}
