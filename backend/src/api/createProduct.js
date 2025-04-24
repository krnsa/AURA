import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import supabase from "../supabase/supabaseClient.js";

export default async function createProduct(productData) {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // console.log("Product data received:", productData);
    console.log("Uploading image to Cloudinary...");

    // Upload the image to Cloudinary
    const uploadStr = `data:image/jpeg;base64,${productData.image}`;
    const uploadResult = await cloudinary.uploader.upload(uploadStr, {
      resource_type: "auto",
    });

    console.log("Image uploaded successfully to Cloudinary");

    // Insert into Supabase listings table
    console.log("Inserting data into Supabase");

    const { data, error } = await supabase.from("listings").insert([
      {
        user: productData.userId,
        title: productData.title,
        body: productData.description,
        price: productData.price,
        image: uploadResult.secure_url, // Store Cloudinary image URL
      },
    ]);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return {
      success: true,
      listing: data,
      imageUrl: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return {
      error: true,
      message: error.message,
    };
  }
}
