import { parseBody, send } from "./utils/utils.js";
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
import getFollowers from "./api/followers/getFollowers.js";
import followUser from "./api/followers/followUser.js";
import unfollowUser from "./api/followers/unfollowUser.js";
import getNotifications from "./api/notifications/getNotifications.js";
import markNotificationRead from "./api/notifications/markNotifications.js";

export const routes = {
  "GET /": async (req, res, decodedData) => {
    const username = decodedData.username;
    send(res, 200, {
      success: true,
      message: `Welcome back, ${username}!`,
      user: { username },
    });
  },

  "GET /api/getPosts": async (req, res, decodedData) => {
    const fullUrl = new URL(req.url, `http://${req.headers.host}`);
    const user_id = fullUrl.searchParams.get("user_id");
    const { data, error } = await getPosts(user_id);
    send(res, error.length > 0 ? 400 : 200, data);
  },

  "GET /api/getPostByID": async (req, res, decodedData) => {
    const fullUrl = new URL(req.url, `http://${req.headers.host}`);
    const post_id = fullUrl.searchParams.get("id");
    const result = await getPostByID(post_id);
    send(res, result.error ? 404 : 200, result);
  },

  "GET /api/findUser": async (req, res, decodedData) => {
    const fullUrl = new URL(req.url, `http://${req.headers.host}`);
    const param_username = fullUrl.searchParams.get("username");
    const user = await findUser(param_username);
    send(res, user.error ? 404 : 200, user);
  },

  "POST /api/newPost": async (req, res, decodedData) => {
    const { user_id, post_body, post_file, linked_listing } = await parseBody(req);
    const result = await newPost(user_id, post_body, post_file);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/removePost": async (req, res, decodedData) => {
    const { user_id, post_id } = await parseBody(req);
    const { data, error } = await removePost(user_id, post_id);
    console.log(data);
    console.log(error);
    send(res, error.length > 0 ? 400 : 200, data);
  },

  "GET /api/notifications": async (req, res, decodedData) => {
    const username = decodedData.username;
    const result = await getNotifications(username);
    send(res, result.error ? 400 : 200, result);
  },

  "GET /api/messages": async (req, res, decodedData) => {
    const username = decodedData.username;
    const result = await getMessages(username);
    // Include current user ID in the response
    if (!result.error) {
      // result.currentUserId = userId;
    }
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/sendMessage": async (req, res, decodedData) => {
    const { user_id, receiver_id, content } = await parseBody(req);
    console.log("Received content:", user_id, receiver_id, content);
    const result = await sendMessage(user_id, receiver_id, content);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/searchUsers": async (req, res, decodedData) => {
    const { searchQuery } = await parseBody(req);
    const result = await searchUsers(searchQuery);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/getProducts": async (req, res, decodedData) => {
    const { searchQuery } = await parseBody(req);
    const result = await getProducts(searchQuery);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/createProduct": async (req, res, decodedData) => {
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

  "POST /api/search": async (req, res, decodedData) => {
    const { searchQuery, filter } = await parseBody(req);
    const result = await getSearches(searchQuery, filter);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/likePost": async (req, res, decodedData) => {
    const username = decodedData.username;
    const { post_id } = await parseBody(req);
    const result = await likePost(username, post_id);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/removeLike": async (req, res, decodedData) => {
    const username = decodedData.username;
    const { post_id } = await parseBody(req);
    const result = await removeLike(username, post_id);
    send(res, result.error ? 400 : 200, result);
  },

  "GET /api/getFollowers": async (req, res, decodedData) => {
    const fullUrl = new URL(req.url, `http://${req.headers.host}`);
    const param_username = fullUrl.searchParams.get("username");
    const result = await getFollowers(param_username);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/followUser": async (req, res, decodedData) => {
    const username = decodedData.username;
    const { user_to_follow } = await parseBody(req);
    const result = await followUser(user_to_follow, username);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/unfollowUser": async (req, res, decodedData) => {
    const username = decodedData.username;
    const { user_to_unfollow } = await parseBody(req);
    const result = await unfollowUser(user_to_unfollow, username);
    send(res, result.error ? 400 : 200, result);
  },

  "POST /api/notifications/read": async (req, res, decodedData) => {
    const username = decodedData.username;
    const { notification_id } = await parseBody(req);
    const result = await markNotificationRead(username, notification_id);
    send(res, result.error ? 400 : 200, result);
  },
};
