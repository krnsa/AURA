import { getAllowedOrigin, parseBody, send } from "./utils/utils.js";
import { registerUser, loginUser, requireAuth } from "./auth/auth.js";
import findUser from "./api/findUser.js";
import newPost from "./implementations/newPost.js";
import getPosts from "./api/getPosts.js";
import getPostByID from "./api/getPostByID.js";
import removePost from "./implementations/removePost.js";
import getMessages from "./api/getMessages.js";
import sendMessage from "./implementations/sendMessage.js";
import searchUsers from "./api/searchUsers.js";
import getProducts from "./api/getProducts.js";
import createProduct from "./api/createProduct.js";
import getSearches from "./api/getSearches.js";
import likePost from "./api/likes/likePost.js";
import removeLike from "./api/likes/removeLike.js";
import getFollowers from "./api/followers/getFollowers.js"
import followUser from "./api/followers/followUser.js";
import unfollowUser from "./api/followers/unfollowUser.js";
//import getNotifications from "./api/getNotifications.js";

const { URL } = await import('url'); // Node's built-in URL module

// -------------------------- CORS Configuration --------------------------
const devOrigins = ["http://localhost:3000"];
const prodOrigins = ["https://auraplatform.vercel.app"];
const allowedMethods = "GET, POST, PUT, DELETE, OPTIONS";
const allowedHeaders = "Content-Type, Authorization";

// -------------------------- Request Handler --------------------------

export async function handleRequest(req, res) {
  // -------------------------- Initialization --------------------------

  console.log(req.url);

  const fullUrl = new URL(req.url, `http://${req.headers.host}`); 


  const origin = req.headers.origin;
  const allowedOrigin = getAllowedOrigin(origin, devOrigins, prodOrigins);

  // Set CORS headers for all responses
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }
  res.setHeader("Access-Control-Allow-Methods", allowedMethods);
  res.setHeader("Access-Control-Allow-Headers", allowedHeaders);
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight request for CORS
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // -------------------------- Public Routes --------------------------

  // Register route
  if (req.url === "/api/register" && req.method === "POST") {
    const { username, password } = await parseBody(req);
    const result = await registerUser(username, password);
    send(res, result.error ? 400 : 200, result);
    return;
  }

  // Login route
  if (req.url === "/api/login" && req.method === "POST") {
    const { username, password } = await parseBody(req);
    const result = await loginUser(username, password);
    send(res, result.error ? 401 : 200, result);
    return;
  }

  // -------------------------- Authentication Check --------------------------

  // Check for authorization header
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    send(res, 401, { error: "Missing token" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const authResult = requireAuth(token);
  if (authResult.error) {
    send(res, 401, { error: "Invalid or expired token." });
    return;
  }

  // user information is decoded and can be used in the routes below
  const decodedData = authResult.data;
  const username = decodedData.username;
  const role = decodedData.role;
  // -------------------------- Protected Routes --------------------------

  const routes = {
    // Home route (authenticated user welcome message)
    "GET /": async () => {
      send(res, 200, {
        success: true,
        message: `Welcome back, ${username}!`,
        user: { username },
      });
    },
    // getPosts route
    // takes in a body with either a user_id or null, null returns all
    "GET /api/getPosts": async () => {
      const user_id = fullUrl.searchParams.get('user_id');
      const { data, error } = await getPosts(user_id);
      send(res, error.length > 0 ? 400 : 200, data);
    },
    // getPostByID route
    "GET /api/getPostByID": async () => {
      const post_id = fullUrl.searchParams.get('id');
      const result = await getPostByID(post_id);
      send(res, result.error ? 404 : 200, result);
    },
    // findUser route
    // takes in username returns user_id
    "GET /api/findUser": async () => {
      const param_username = fullUrl.searchParams.get('username');
      const result = await findUser(param_username);
      send(res, result.error ? 404 : 200, result);
    },
    // newPost route
    "POST /api/newPost": async () => {
      const { user_id, post_body, post_file, linked_listing } = await parseBody(req);
      const result = await newPost(user_id, post_body, post_file);
      send(res, result.error ? 400 : 200, result);
    },
    // removePost route
    "POST /api/removePost": async () => {
      const { user_id, post_id } = await parseBody(req);
      const { data, error } = await removePost(user_id, post_id);
      console.log(data);
      console.log(error);
      send(res, error.length > 0 ? 400 : 200, data);
    },

    // getNotifications route
    // "GET /api/notifications": async () => {
    //   const result = await getNotifications(username); 1Has a conversation. Original line has a conversation.
    //   send(res, result.error ? 400 : 200, result);
    // },

    // Get messages route
    "GET /api/messages": async () => {
      const result = await getMessages(username);
      // Include current user ID in the response
      if (!result.error) {
        // result.currentUserId = userId;
      }

      send(res, result.error ? 400 : 200, result);
    },
    // Send message route
    "POST /api/sendMessage": async () => {
      const { user_id, receiver_id, content } = await parseBody(req);
      console.log("Received content:", user_id, receiver_id, content);
      const result = await sendMessage(user_id, receiver_id, content);
      send(res, result.error ? 400 : 200, result);
    },

    "POST /api/searchUsers": async () => {
      const { searchQuery } = await parseBody(req);
      const result = await searchUsers(searchQuery);
      send(res, result.error ? 400 : 200, result);
    },

    "POST /api/getProducts": async () => {
      const { searchQuery } = await parseBody(req);
      const result = await getProducts(searchQuery);
      send(res, result.error ? 400 : 200, result);
    },

    "POST /api/createProduct": async () => {
      try {
        const productData = await parseBody(req);

        const result = await createProduct(productData);
        send(res, result.error ? 400 : 200, result);
      } catch (error) {
        console.error("Error in upload route:", error);
        send(res, 400, {
          error: true,
          message: "Failed to process upload: " + error.message,
        });
      }
    },

    "POST /api/search": async () => {
      const { searchQuery, filter } = await parseBody(req);
      const result = await getSearches(searchQuery, filter);
      send(res, result.error ? 400 : 200, result);
    },
    "POST /api/likePost": async () => {
      const { post_id } = await parseBody(req);
      const result = await likePost(username, post_id);
      send(res, result.error ? 400 : 200, result);
    },
    "POST /api/removeLike": async () => {
      const { post_id } = await parseBody(req);
      const result = await removeLike(username, post_id);
      send(res, result.error ? 400 : 200, result);
    },
    "GET /api/getFollowers": async () => {
      const param_username = fullUrl.searchParams.get('username');
      const result = await getFollowers(param_username);
      send(res, result.error ? 400 : 200, result);
    },
    "POST /api/followUser": async () => {
      const { user_to_follow } = await parseBody(req);
      const result = await followUser(user_to_follow, username);
      send(res, result.error ? 400 : 200, result);
    },
    "POST /api/unfollowUser": async () => {
      const { user_to_unfollow } = await parseBody(req);
      const result = await unfollowUser(user_to_unfollow, username);
      send(res, result.error ? 400 : 200, result);
    },
  };

  const routeKey = `${req.method} ${req.url.split("?")[0]}`;
  if (routes[routeKey]) {
    await routes[routeKey]();
    return;
  }

  // -------------------------- Fallback: 404 Not Found --------------------------
  send(res, 404, { success: false, message: "Not Found" });
}
