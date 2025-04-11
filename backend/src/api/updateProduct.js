// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function updateProduct(id, updates) {
  if (!id || !updates) {
    console.log("Missing product ID or update data.");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    } else if (!data || data.length === 0) {
      console.log("Product not updated or not found.");
      return { message: "No data returned" };
    } else {
      console.log(data, "Product updated successfully:");
      return data[0];
    }
  } catch (err) {
    console.error("Error updating product:", err.message);
    throw err;
  }
}
