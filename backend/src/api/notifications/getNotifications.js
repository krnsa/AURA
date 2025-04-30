import supabase from "../../supabase/supabaseClient.js";

export default async function getNotifications(username) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, settings')
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
          avatar,
          display_name,
          verified
        ),
        related_post:posts(
          id,
          content,
          image_url
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
      priority: getPriorityLevel(notification.type),
      trigger_user: notification.trigger_user ? {
        username: notification.trigger_user.username,
        avatar: notification.trigger_user.avatar,
        display_name: notification.trigger_user.display_name,
        verified: notification.trigger_user.verified
      } : null,
      related_content: notification.related_post ? {
        post_id: notification.related_post.id,
        preview: notification.related_post.content?.substring(0, 100),
        has_image: !!notification.related_post.image_url
      } : null,
      action_url: generateActionUrl(notification),
      time_ago: getTimeAgo(notification.created_at)
    }));

    return { 
      notifications: formattedNotifications,
      unread_count: formattedNotifications.filter(n => !n.read).length,
      has_more: notifications.length === 50,
      user_settings: userData.settings?.notifications || {},
      error: null 
    };
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return { error: 'Internal server error' };
  }
}

function getPriorityLevel(type) {
  const priorities = {
    'message': 'high',
    'follow': 'medium',
    'like': 'low',
    'comment': 'medium',
    'system': 'high'
  };
  return priorities[type] || 'low';
}

function generateActionUrl(notification) {
  switch (notification.type) {
    case 'like':
    case 'comment':
      return `/post/${notification.related_post?.id}`;
    case 'follow':
      return `/profile/${notification.trigger_user?.username}`;
    case 'message':
      return `/messages/${notification.trigger_user?.username}`;
    default:
      return '/notifications';
  }
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
}