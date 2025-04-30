import supabase from "../../supabase/supabaseClient.js";

export default async function createNotification(userId, type, title, message, triggerUserId = null) {
  try {
    const validTypes = ['like', 'comment', 'follow', 'message', 'system'];
    if (!validTypes.includes(type)) {
      return { error: 'Invalid notification type' };
    }

    if (type === 'like') {
      const { data: existingLike } = await supabase
        .from('notifications')
        .select()
        .eq('user_id', userId)
        .eq('trigger_user_id', triggerUserId)
        .eq('type', 'like')
        .single();

      if (existingLike) {
        return { notification: existingLike, error: null };
      }
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        trigger_user_id: triggerUserId,
        type,
        title,
        message,
        read: false
      }])
      .select();

    if (error) {
      return { error: 'Failed to create notification' };
    }

    return { notification: data[0], error: null };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return { error: 'Internal server error' };
  }
}