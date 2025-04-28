// import supabase client
import supabase from "../../supabase/supabaseClient.js";

export default async function unfollowUser(user_to_unfollow, following_user) {

  const {data, error} = await supabase.from('followers').delete().eq('followed_user', user_to_unfollow).eq('following_user', following_user)

  console.log(data, error)

  if(error) {
    return {error}
  }

  return {data};
}