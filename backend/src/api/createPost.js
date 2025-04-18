// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function createPost(user, body, url = null, linked_listing = null) {

  if (user, body == null) {
    console.log("Null parameters entered for required field.");
    return;
  }
 


  try {
    const { data, error } = await supabase.from("posts").insert([
      {
        "user": user,
        "body": body,
        "url": url,
        "linked_listing": linked_listing
      }
    ]);

    if (error) {
      throw error;
    } else if (data == null) {
      console.log("empty/no response from Supabase");
    } else if (data.length === 0) {
      console.log("Supabase query succeeded with empty response string.");
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
