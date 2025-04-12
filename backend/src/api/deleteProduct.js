// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function deleteProduct(id) {
  if (id === null || id === undefined) {
    console.log("Null or undefined parameters entered for required field.");
  }

  try {
    const { data, error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw error;
    } else if (data == null) {
      console.log("empty/no response from Supabase");
    } else if (data.length === 0) {
      console.log("Supabase query succeeded with empty response string.");
      return { message: "No data found" };
    } else {
      console.log(data, "Supabase query succeeded:");
      return data;
    }
  } catch (err) {
    console.error("Supabase query failed:", err.message);
    throw err;
  }
}
