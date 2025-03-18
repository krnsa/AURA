import createPost from "../../src/routes/createPost.js";
import uploadImage from "../../src/routes/uploadImage.js";

export default async function newPost(user_id, body, file = null) {

    if(user_id, body == null) {
        console.log("Null value entered for non-null required parameters.");
        return;
    }

    var image_path = null;

    if (file != null) {
        image_path = await uploadImage(file);
    }

    console.log();
    
    const resp = await createPost(user_id, body, image_path);
    
}