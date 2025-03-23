// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function getPostByID(post_id) {

  try {

    const { data, error } = await supabase.from("posts").select("*").eq("id", post_id);
 
    if (error) {
      throw error;
    } else if (data.length === 0) {
      console.log("Supabase query succeeded but no data found.");
      return [];
    } else {
      //console.log(data, "Supabase query succeeded:");
      return data;
    }
  } catch (err) {
    console.error("Supabase query failed:", err.message);
    throw err;
  }
}
