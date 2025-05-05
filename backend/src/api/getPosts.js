import supabase from "../supabase/supabaseClient.js";

async function fetchPosts(user_id) {
  if (user_id) {
    return supabase
      .from("posts")
      .select("*, users!posts_user_fkey(username, avatar_url)")
      .eq("user", user_id);
  }
  return supabase.from("posts").select("*, users!posts_user_fkey(username, avatar_url)");
}

async function fetchLikesForPost(postId) {
  const { data: likesData, error: likesError } = await supabase
    .from("likes")
    .select("liking_user")
    .eq("post", postId);

  if (likesError) throw new Error(`Error fetching likes for post ${postId}: ${likesError.message}`);
  return likesData.map((like) => like.liking_user);
}

export default async function getPosts(user_id) {
  try {
    const { data: posts, error: postsError } = await fetchPosts(user_id);

    if (postsError) throw new Error(`Error fetching posts: ${postsError.message}`);
    if (!posts || posts.length === 0) {
      return { data: [], error: "No posts found." };
    }

    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likes = await fetchLikesForPost(post.id);
        // Extract username and avatar_url from users object
        const username = post.users?.username || "Unknown user";
        const avatar_url = post.users?.avatar_url || "/img/default-avatar.png";

        // Remove the users object to avoid nesting and add username/avatar directly
        const { users, ...postWithoutUsers } = post;

        return {
          ...postWithoutUsers,
          username,
          avatar_url,
          likes,
        };
      })
    );

    return { data: postsWithLikes, error: "" };
  } catch (error) {
    return { data: [], error: error.message };
  }
}
