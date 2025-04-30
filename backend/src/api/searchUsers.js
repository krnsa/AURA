import supabase from "../supabase/supabaseClient.js";

async function searchUsers(searchQuery) {
  try {
    if (!searchQuery || searchQuery.trim() === "") {
      return { users: [], error: null };
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, username, avatar_url")
      .ilike("username", `%${searchQuery}%`)
      .limit(10);

    if (error) {
      console.error("Error searching users:", error);
      return { error: "Failed to search users" };
    }

    return {
      users: data,
      error: null,
    };
  } catch (err) {
    console.error("Server error in searchUsers:", err);
    return { error: "Server error" };
  }
}

export default searchUsers;
