// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function uploadImage(file) {

  try {
    const fileName = `${Date.now()}-${file.name}`; // Generate unique file name

    const { data, error } = await supabase.storage
      .from("content")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    console.log("Uploaded image:", data);
    return data.path; // ✅ Save this path in the backend

  } catch (err) {
    console.error("Supabase upload failed:", err.message);
    throw err;
  }
}
