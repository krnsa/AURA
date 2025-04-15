// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function deletePost(id) {

  if (id == null) {
    console.log("Null parameters entered for required field.");
    return;
  }
 
  try {
    const { data, error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      throw error;
    } else if (data == null) {
      // null data actually indicates a successfull deletion in practice.
      return { data: data, error: "" };
    } else if (data.length === 0) {
      return { data: data, error: "Empty string from Supabase" };
    } else {
      return {data: data, error: ""};
    }
  } catch (err) {
    console.error("Supabase query failed:", err.message);
    throw err;
  }

}
