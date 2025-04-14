// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function getPosts(user_id = null) {

  try {

    let data = null;
    let error = null;

    if (user_id != null) {
      ({ data, error } = await supabase.from("posts").select("*").eq("user", user_id));
    } else {
      ({ data, error } = await supabase.from("posts").select("*"));
    }

    if(data.length == 0) {
      return {'data': data, 'error': "No posts found."};
    } else if(data === null) {
      return {'data': data, 'error': "Supabase returns null."};
    } else {
      return {'data': data, 'error': ""};
    }

  } catch (error) {
      throw error;
  } 
}