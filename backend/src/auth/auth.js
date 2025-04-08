import "dotenv/config";
import supabase from "../supabase/supabaseClient.js";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("Missing JWT_SECRET in .env file under backend directory.");
}

export async function registerUser(username, password) {
  try {
    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username);

    if (findError) {
      console.error(
        "Error checking user existence while accessing the database:",
        findError.message
      );
      return { error: "Failed to check if user exists. Please try again later." };
    }

    if (existingUser.length > 0) {
      return { error: "The username is already taken. Please choose another one." };
    }

    // Insert user to Supabase
    const { error: insertError } = await supabase.from("users").insert([{ username, password }]);

    if (insertError) {
      console.error("Error inserting user into the database:", insertError.message);
      return { error: "Failed to register user. Please try again later." };
    }

    return { success: true, message: "Register success." };
  } catch (err) {
    console.error("Unexpected error during registration:", err.message);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function loginUser(username, password) {
  const { data: user, error } = await supabase.from("users").select("*").eq("username", username);

  if (error || user.length === 0) {
    return {
      error:
        "Invalid credentials: User not found or an error occurred while accessing the database.",
    };
  }

  // username is unique, so we can safely access the first element
  // Check if the password matches
  if (user[0].password !== password) {
    return { error: "Invalid credentials: Password does not match." };
  }
  // Default role is "user"
  const payload = { username, role: "user" };
  // Generate a JWT token
  const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
  return { success: true, token };
}

export function requireAuth(token) {
  try {
    const decodedData = jwt.verify(token, SECRET);
    return { success: true, data: decodedData };
  } catch (err) {
    return { error: "Token invalid or expired." };
  }
}
