// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function getPostByID(post_id) {
  try {
    const { data, error } = await supabase.from("posts").select("*").eq("id", post_id);

    if (data.length == 0) {
      return { data: data, error: "Post not found." };
    } else if (data === null) {
      return { data: data, error: "Supabase returns null." };
    } else {
      return { data: data[0], error: "" };
    }
  } catch (error) {
    throw error;
  }
}
