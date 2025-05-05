import supabase from "../../supabase/supabaseClient.js";

export default async function getFollowers(username) {
  try {
    // followers
    const { data: followers, error: followersError } = await supabase
      .from("followers")
      .select("*")
      .eq("followed_user", username);

    if (followersError) {
      return { error: followersError };
    }

    // following
    const { data: following, error: followingError } = await supabase
      .from("followers")
      .select("*")
      .eq("following_user", username);

    if (followingError) {
      return { error: followingError };
    }

    // Return the followers and following data
    return {
      data: {
        followers: followers || [],
        following: following || [],
      },
    };
  } catch (error) {
    console.error("Error fetching followers:", error);
    return { error: error.message };
  }
}
