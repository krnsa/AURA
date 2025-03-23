// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function testDatabase() {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) {
      throw error;
    } else if (data.length === 0) {
      console.log("Supabase query succeeded but no data found.");
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
