// import supabase client
import supabase from "../../supabase/supabaseClient.js";

export default async function removeLike(username, post_id) {

  const {data, error} = await supabase.from('likes').delete().eq('post', post_id).eq('liking_user', username);
  

  if(error) {
    return {error}
  }

  return {success: true};
}