import findUser from "../api/findUser.js";
import newPost from "../implementations/newPost.js";
import getPosts from "../api/getPosts.js";
import fs from "fs";
import path from "path";
import getPostByID from "../api/getPostByID.js";
import removePost from "../implementations/removePost.js";


//                      user_id, post_id
const resp = await removePost(1, 21)