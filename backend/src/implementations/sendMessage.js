import supabase from "../supabase/supabaseClient.js";

/**
 * Send a new message from one user to another
 * @param {number} sender_id - ID of the user sending the message
 * @param {number} receiver_id - ID of the user receiving the message
 * @param {string} content - Message content
 * @returns {object} Created message object or error
 */
async function sendMessage(sender_id, receiver_id, content) {
  try {
    // Validate inputs
    if (!sender_id || !receiver_id || !content) {
      return { error: "Missing required fields" };
    }

    // Create new message in database
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id,
        receiver_id,
        content,
        is_read: false,
      })
      .select();

    if (error) {
      console.error("Error sending message:", error);
      return { error: "Failed to send message" };
    }

    // Return the created message
    return {
      message: data[0],
      error: null,
    };
  } catch (err) {
    console.error("Server error in sendMessage:", err);
    return { error: "Server error" };
  }
}

export default sendMessage;
