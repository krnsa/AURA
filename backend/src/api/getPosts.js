// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function getPosts(user_id = null) {

  try {

    let data = null;
    let error = null;

    if(user_id != null) {
      ({ data, error } = await supabase.from("posts").select("*").eq("user", user_id));
    } else {
      ({ data, error } = await supabase.from("posts").select("*"));
    }

    if (error) {
      throw error;
    } else if (data.length === 0) {
      console.log("Supabase query succeeded but no data found.");
      return { message: "No data found" };
    } else {
      //console.log(data, "Supabase query succeeded:");
      return data;
    }
  } catch (err) {
    console.error("Supabase query failed:", err.message);
    throw err;
  }
}
