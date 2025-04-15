import supabase from "../supabase/supabaseClient.js";

export default async function createListing({ userId, title, body = "", price, image = "" }) {
  if (typeof userId !== "string" || typeof title !== "string" || typeof price !== "number") {
    return {
      success: false,
      error: "Invalid input types: userId and title must be strings, price must be a number.",
    };
  }

  try {
    const { data, error } = await supabase.from("listings").insert([
      {
        user_id: userId,
        title,
        body,
        price,
        image,
      },
    ]).select();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to create listing.",
      };
    }

    return {
      success: true,
      data: data[0],
      message: "Listing created successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Unexpected server error.",
    };
  }
}



