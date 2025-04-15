import createListing from "../../api/createListing.js"; 

export default async function getListings({ userId, title, price, body = "", image = "" }) {
  if (!userId || !title || typeof price !== "number") {
    return {
      success: false,
      error: "Missing or invalid required fields.",
    };
  }

  const creationResult = await createListing({
    userId,
    title,
    body,
    price,
    image,
  });

  if (!creationResult.success) {
    return {
      success: false,
      error: creationResult.error,
    };
  }

  const listings = [];

  return {
    success: true,
    created: creationResult.data,
    listings: listings,  
    message: "Listing created successfully.",
  };
}
