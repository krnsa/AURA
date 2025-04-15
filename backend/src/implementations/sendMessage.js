import supabase from "../supabase/supabaseClient.js";

/**
 * Send a new message from one user to another
 * @param {number} sender_id - ID of the user sending the message
 * @param {number} receiver_id - ID of the user receiving the message
 * @param {string} messageText - Message content
 * @returns {object} Updated conversation object or error
 */
async function sendMessage(sender_id, receiver_id, messageText) {
  try {
    // Validate inputs
    if (!sender_id || !receiver_id || !messageText) {
      return { error: "Missing required fields" };
    }

    // Check if a conversation already exists between these users
    const { data: existingConversation, error: fetchError } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`
      );

    console.log("Existing conversation:", existingConversation);

    if (fetchError) {
      console.error("Error checking for existing conversation:", fetchError);
      return { error: "Failed to send message" };
    }

    const now = new Date().toISOString();
    const newMessage = {
      sender_id: sender_id,
      message: messageText,
      timestamp: now,
    };

    if (existingConversation && existingConversation.length > 0) {
      // Conversation exists, update it with the new message
      const conversation = existingConversation[0];
      let currentContent = [];

      try {
        if (conversation.content) {
          currentContent =
            typeof conversation.content === "string"
              ? JSON.parse(conversation.content)
              : conversation.content;
        }
      } catch (e) {
        console.error("Error parsing existing content:", e);
      }

      // Add new message to existing content
      currentContent.push(newMessage);

      // Update conversation
      const { data, error } = await supabase
        .from("messages")
        .update({
          content: currentContent,
          is_read: false,
          created_at: now, // Update timestamp to sort conversations by most recent message
        })
        .eq("id", conversation.id)
        .select();

      if (error) {
        console.error("Error updating conversation:", error);
        return { error: "Failed to send message" };
      }

      return {
        conversation: data[0],
        newMessage,
        error: null,
      };
    } else {
      // Create new conversation
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id,
          receiver_id,
          content: [newMessage],
          is_read: false,
        })
        .select();

      if (error) {
        console.error("Error creating conversation:", error);
        return { error: "Failed to send message" };
      }

      return {
        conversation: data[0],
        newMessage,
        error: null,
      };
    }
  } catch (err) {
    console.error("Server error in sendMessage:", err);
    return { error: "Server error" };
  }
}

export default sendMessage;
