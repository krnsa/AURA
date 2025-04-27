// import supabase client
import supabase from "../../supabase/supabaseClient.js";

export default async function followUser(user_to_follow, following_user) {

  const {data, error} = await supabase.from('followers').insert({
    followed_user: user_to_follow,
    following_user: following_user
  });

  console.log(data, error)

  if(error) {
    return {error}
  }

  return {data};
}