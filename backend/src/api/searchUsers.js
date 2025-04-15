import supabase from "../supabase/supabaseClient.js";

/**
 * Search for users based on a query string
 * @param {string} searchQuery - The search query to find users
 * @returns {object} Object with users array or error
 */
async function searchUsers(searchQuery) {
  try {
    if (!searchQuery || searchQuery.trim() === "") {
      return { users: [], error: null };
    }

    // Use ilike for case-insensitive search
    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .ilike("username", `%${searchQuery}%`)
      .limit(10); // Limit to 10 results for performance

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
