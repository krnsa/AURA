import supabase from "../supabase/supabaseClient.js";

/**
 * Fetch products from the database
 * @param {string} searchQuery - Optional search query to filter products
 * @returns {object} Object with products array or error
 */
async function getProducts(searchQuery = null) {
  try {
    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    // If search query is provided, filter by title
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return { error: "Failed to fetch products" };
    }

    return {
      products: data,
      error: null,
    };
  } catch (err) {
    console.error("Server error in getProducts:", err);
    return { error: "Server error" };
  }
}

export default getProducts;
