import supabase from "../../supabase/supabaseClient.js";

export async function getNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
        id,
        type,
        title,
        message,
        created_at,
        read,
        trigger_user_id,
        users:trigger_user_id(username, avatar)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error("Failed to fetch notifications");
    }

    const notifications = data.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      created_at: notification.created_at,
      read: notification.read,
      trigger_user: notification.users
        ? { username: notification.users.username, avatar: notification.users.avatar }
        : null,
    }));

    return { notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { error: error.message };
  }
}

export async function markNotificationAsRead(notificationId, userId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .match({ id: notificationId, user_id: userId })
      .single();

    if (error || !data) {
      throw new Error("Notification not found");
    }

    return { message: "Notification marked as read" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { error: error.message };
  }
}

export async function createNotification(userId, type, title, message, triggerUserId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
          trigger_user_id: triggerUserId,
          created_at: new Date(),
        },
      ])
      .single();

    if (error) {
      throw new Error("Failed to create notification");
    }

    return { notification: data };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { error: error.message };
  }
}
