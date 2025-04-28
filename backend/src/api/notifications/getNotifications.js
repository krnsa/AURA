import supabase from "../../supabase/supabaseClient.js";

export default async function getNotifications(username) {
  try {

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError) {
      return { error: 'Failed to fetch user data' };
    }

    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select(`
        *,
        trigger_user:users!notifications_trigger_user_id_fkey (
          username,
          avatar
        )
      `)
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notifError) {
      return { error: 'Failed to fetch notifications' };
    }

    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      created_at: notification.created_at,
      read: notification.read,
      trigger_user: notification.trigger_user ? {
        username: notification.trigger_user.username,
        avatar: notification.trigger_user.avatar
      } : null
    }));

    return { notifications: formattedNotifications, error: null };
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return { error: 'Internal server error' };
  }
} 