// import supabase client
import supabase from "../../supabase/supabaseClient.js";

export default async function likePost(username, post_id) {

  const {data, error} = await supabase.from('likes').insert({
    post: post_id,
    liking_user: username
  })

  if(error) {
    return {error}
  }

  return {success: true};
}