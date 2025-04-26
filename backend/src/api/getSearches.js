import searchUsers from "./searchUsers.js";
import supabase from "../supabase/supabaseClient.js";
import getProducts from "./getProducts.js";

export default async function getSearches(searchQuery, filter = "all") {
  const results = {};
  if (filter === "all" || filter === "people") {
    const { users, error: uErr } = await searchUsers(searchQuery);
    if (uErr) return { error: uErr };
    results.users = users;
  }
  if (filter === "all" || filter === "posts") {
    const { data: posts, error: pErr } = await supabase
      .from("posts")
      .select("*, user:users(username)")
      .ilike("body", `%${searchQuery}%`)
      .limit(10);
    if (pErr) return { error: "Failed to search posts" };
    results.posts = posts.map((p) => ({ ...p, username: p.user.username }));
  }
  if (filter === "all" || filter === "products") {
    const { products, error: prErr } = await getProducts(searchQuery);
    if (prErr) return { error: prErr };
    results.products = products;
  }
  return { ...results, error: null };
}
