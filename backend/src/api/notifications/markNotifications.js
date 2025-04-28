import supabase from "../../supabase/supabaseClient.js";

export default async function markNotificationRead(username, notificationId) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError) {
      return { error: 'Failed to fetch user data' };
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userData.id)
      .select();

    if (error) {
      return { error: 'Failed to update notification' };
    }

    if (!data || data.length === 0) {
      return { error: 'Notification not found' };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    return { error: 'Internal server error' };
  }
} 