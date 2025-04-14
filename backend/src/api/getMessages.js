import supabase from "../supabase/supabaseClient.js";
import findUser from "./findUser.js";

/**
 * Get all messages for a specific user (both sent and received)
 * @param {number} userId - The user ID to get messages for
 * @returns {object} Object with messages array or error
 */
async function getMessages(userName) {
  try {
    const userId = (await findUser(userName))[0].id;

    // console.log("User ID:", userId);

    // Query Supabase for messages where user is either sender or receiver
    console.log("User ID:", userId);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      console.error("Error fetching messages:", error);
      return { error: "Failed to fetch messages" };
    }

    // Mark received messages as read
    const unreadMessages = data.filter(
      (msg) => msg.receiver_id === userId && !msg.is_read
    );

    if (unreadMessages.length > 0) {
      // Update messages to mark them as read
      const { error: updateError } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in(
          "id",
          unreadMessages.map((msg) => msg.id)
        );

      if (updateError) {
        console.error("Error updating read status:", updateError);
      }
    }

    // Get unique user IDs from the messages for fetching user data
    const userIds = [
      ...new Set([
        ...data.map((msg) => msg.sender_id),
        ...data.map((msg) => msg.receiver_id),
      ]),
    ].filter((id) => id !== userId);

    // Fetch user data for the conversations
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, username")
      .in("id", userIds);

    if (userError) {
      console.error("Error fetching user data:", userError);
      // Continue anyway, we'll use placeholder names
    }

    // Create a map of user IDs to usernames
    const userMap = {};
    if (userData) {
      userData.forEach((user) => {
        userMap[user.id] = user.username;
      });
    }

    // Enhance messages with user data where available
    const enhancedMessages = data.map((message) => {
      const otherUserId =
        message.sender_id === userId ? message.receiver_id : message.sender_id;
      return {
        ...message,
        otherUserName: userMap[otherUserId] || `User ${otherUserId}`,
      };
    });

    return {
      messages: enhancedMessages,
      error: null,
    };
  } catch (err) {
    console.error("Server error in getMessages:", err);
    return { error: "Server error" };
  }
}

export default getMessages;
