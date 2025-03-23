import findUser from "../api/findUser.js";
import newPost from "../implementations/newPost.js";
import getPosts from "../api/getPosts.js";
import fs from "fs";
import path from "path";

newPost(1, "test");

const filePath = path.resolve("./img/test.jpg");
const fileBuffer = fs.readFileSync(filePath);

// Create a Blob (Supabase accepts Blobs like Files)
const file = new File([fileBuffer], "test-image.jpg", { type: "image/jpeg" });

await newPost(3, "test 3");

console.log(findUser("sam.mulvey747"));

let data = await getPosts(3);

console.log(data.length);
