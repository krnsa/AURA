import supabase from "../supabase/supabaseClient.js";

export async function testDatabase() {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      throw error;
    } else if (data.length === 0) {
      console.log("Supabase query succeeded but no data found.");
      return { message: "No data found" };
    } else {
      console.log(data, "Supabase query succeeded:");
      return data;
    }
  } catch (err) {
    console.error("Supabase query failed:", err.message);
    throw err;
  }
}

import findUserID from "./src/api/findUser.js";
import newPost from "./src/implementations/newPost.js";
import getPosts from "./src/api/getPosts.js";
import fs from "fs";
import path from "path";

createPost(1, "test");

const filePath = path.resolve("./img/test.jpg");
const fileBuffer = fs.readFileSync(filePath);

// Create a Blob (Supabase accepts Blobs like Files)
const file = new File([fileBuffer], "test-image.jpg", { type: "image/jpeg" });

await newPost(3, "test 3");

console.log(findUserID("sam.mulvey747"));

let data = await getPosts(3);

console.log(data.length);
