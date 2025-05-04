import deletePost from "../api/deletePost.js";
import getPostByID from "../api/getPostByID.js";

export default async function removePost(user_id, post_id) {
  if (user_id == null || post_id == null) {
    return { data: null, error: "Null parameter entered." };
  }

  const { data: post, error: error_message } = await getPostByID(post_id);

  if (error_message) {
    return { data: null, error: error_message };
  }

  const post_user_id = post.user;

  if (user_id != post_user_id) {
    return { data: null, error: "Attempting to delete post from different user." };
  }

  const { data, error } = await deletePost(post_id);

  return { data, error };
}
