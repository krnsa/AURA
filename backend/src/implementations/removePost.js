import createPost from "../api/createPost.js";
import deletePost from "../api/deletePost.js";
import getPostByID from "../api/getPostByID.js";
import getPosts from "../api/getPosts.js";
import uploadImage from "../api/uploadImage.js";

export default async function removePost(user_id, post_id) {
  if ((user_id, post_id == null)) {
    console.log("Null value entered for non-null required parameters.");
    return;
  }

  const post = await getPostByID(post_id)

  if(post.length == 0) {
    console.log("Post does not exist.");
    return;
  }

  const post_user_id = post[0]["user"]; 

  if(user_id != post_user_id) {
    console.log("Attempting to delete post from different user.");
    return;
  }

  const resp = await deletePost(post_id);
  
  return resp;
}
