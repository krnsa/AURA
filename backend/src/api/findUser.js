// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function findUser(username) {
  if (username == null) {
    console.log("Null username provided.");
    return;
  }

  try {
    const { data, error } = await supabase.from("users").select("*").eq("username", username);

    if (error) {
      throw error;
    } else if (data.length === 0) {
      //console.log("Supabase query succeeded but no data found.");
      return { message: "No data found" };
    } else {
      //console.log(data, "Supabase query succeeded:");
      // username is unique, so we can safely access the first element
      const user = data[0];
      user.password = undefined; // Remove password from the user object
      return user;
    }
  } catch (err) {
    console.error("Supabase query failed:", err.message);
    throw err;
  }
}
