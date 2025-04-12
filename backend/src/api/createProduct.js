// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function createProduct({ name, description, price, imageUrl }) {
  if (!name || !price) {
    return { error: "Missing required fields: name and price are mandatory." };
  }

  try {
    const { data, error } = await supabase.from("products").insert([
      {
        name,
        description,
        price,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      throw error;
    } else if (!data || data.length === 0) {
      console.log("Supabase query succeeded with empty response.");
      return { message: "Insert successful but no data returned" };
    } else {
      console.log(data, "Supabase insert succeeded:");
      return data[0];
    }
  } catch (err) {
    console.error("Supabase insert failed:", err.message);
    throw err;
  }
}
