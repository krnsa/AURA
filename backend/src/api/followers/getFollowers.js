// import supabase client
import supabase from "../../supabase/supabaseClient.js";

export default async function getFollowers(username) {

  const {data, error} = await supabase.from('followers').select('*').eq('followed_user', username)

  if(error) {
    return {error}
  }

  return {data};
}