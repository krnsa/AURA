// import supabase client
import supabase from "../supabase/supabaseClient.js";

export default async function getPosts(user_id = null) {

  try {

    let data = null;
    let error = null;

    if (user_id != null) {
      ({ data, error } = await supabase.from("posts").select("*").eq("user", user_id));
    } else {
      ({ data, error } = await supabase.from("posts").select("*"));
    }


    let postsWithLikes = [];

    for(const post of data) {
      let likes = [];

      const {data: like_d, error: error_d} = await supabase.from("likes").select("*").eq('post', post.id);

      for(const p of like_d) {
        likes.push(p.liking_user);
      }

      postsWithLikes.push(Object.assign({}, post, {likes}));

    }

    if(data.length == 0) {
      return {'data': postsWithLikes, 'error': "No posts found."};
    } else if(data === null) {
      return {'data': postsWithLikes, 'error': "Supabase returns null."};
    } else {
      return {'data': postsWithLikes, 'error': ""};
    }

  } catch (error) {
      throw error;
  } 
}