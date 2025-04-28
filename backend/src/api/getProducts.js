import supabase from "../supabase/supabaseClient.js";

async function getProducts(searchQuery = null) {
  try {
    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

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
