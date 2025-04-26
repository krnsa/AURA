import supabase from "../supabase/supabaseClient.js";
import findUser from "./findUser.js";

async function getMessages(userName) {
  try {
    const user = await findUser(userName);

    if (!user || user.length === 0) {
      return { error: "User not found" };
    }
    const userId = user[0].id;

    console.log("User ID:", userId);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      console.error("Error fetching messages:", error);
      return { error: "Failed to fetch messages" };
    }

    const unreadConversations = data.filter(
      (conv) => conv.receiver_id === userId && !conv.is_read
    );

    if (unreadConversations.length > 0) {
      const { error: updateError } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in(
          "id",
          unreadConversations.map((conv) => conv.id)
        );

      if (updateError) {
        console.error("Error updating read status:", updateError);
      }
    }

    const userIds = [
      ...new Set([
        ...data.map((conv) => conv.sender_id),
        ...data.map((conv) => conv.receiver_id),
      ]),
    ].filter((id) => id !== userId);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, username")
      .in("id", userIds);

    if (userError) {
      console.error("Error fetching user data:", userError);
    }

    const userMap = {};
    if (userData) {
      userData.forEach((user) => {
        userMap[user.id] = user.username;
      });
    }

    const enhancedConversations = data.map((conversation) => {
      const otherUserId =
        conversation.sender_id === userId
          ? conversation.receiver_id
          : conversation.sender_id;

      let parsedContent = [];
      try {
        if (conversation.content) {
          parsedContent =
            typeof conversation.content === "string"
              ? JSON.parse(conversation.content)
              : conversation.content;
        }
      } catch (e) {
        console.error("Error parsing conversation content:", e);
      }

      return {
        ...conversation,
        otherUserName: userMap[otherUserId] || `User ${otherUserId}`,
        messages: parsedContent,
        otherUserId: otherUserId,
      };
    });

    return {
      conversations: enhancedConversations,
      currentUserId: userId,
      error: null,
    };
  } catch (err) {
    console.error("Server error in getMessages:", err);
    return { error: "Server error" };
  }
}

export default getMessages;
