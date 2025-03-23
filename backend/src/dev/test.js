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

import findUser from "../api/findUser.js";
import newPost from "../implementations/newPost.js";
import getPosts from "../api/getPosts.js";
import fs from "fs";
import path from "path";
import getPostByID from "../api/getPostByID.js";
import removePost from "../implementations/removePost.js";


//                      user_id, post_id
const resp = await removePost(1, 21)