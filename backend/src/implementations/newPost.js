import supabase from "../supabase/supabaseClient.js";
import createPost from "../api/createPost.js";


export default async function newPost(user_id, post_body, post_file = null, linked_listing = null) {
  try {

    let url = null;

    if (post_file) {
      const { buffer, filename, mimeType } = post_file;
      
      const uniqueFilename = `${Date.now()}-${filename}`;
      
      const bucketName = 'content';
      
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(`posts/${uniqueFilename}`, buffer, {
          contentType: mimeType,
          cacheControl: '3600'
        });
      
      if (error) {
        console.error("Supabase storage upload error:", error);
        return { error: "Failed to upload file" };
      }
      
      const { data: urlData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(`posts/${uniqueFilename}`);
      
      url = urlData.publicUrl;
    }
    
    console.log(url);
    await createPost(user_id, post_body, url, linked_listing)
    
    return { success: true, message: "Post created successfully", imageUrl: url};
  } catch (error) {
    console.error("Error in newPost:", error);
    return { error: "Failed to create post" };
  }
}