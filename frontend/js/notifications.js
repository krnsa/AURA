import { supabase } from './supabaseClient.js';

async function fetchNotifications() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('No user logged in');
            return;
        }

        // Fetch notifications from Supabase
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select(`
                *,
                from_user:users!notifications_from_user_id_fkey(username)
            `)
            .eq('to_user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        if (notifications) {
            updateNotificationCount(notifications.length);
            updateNotificationContent(notifications);
        }

    } catch (error) {
        console.error('Error fetching notifications:', error.message);
    }
}

function updateNotificationCount(count) {
    const numberMessage = document.querySelector('.number-message');
    if (numberMessage) {
        numberMessage.textContent = count;
    }
}

function updateNotificationContent(notifications) {
    if (notifications && notifications.length > 0) {
        const latestNotification = notifications[0];
        
        // Update username
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = latestNotification.from_user.username;
        }

        // Update message preview
        const messagePreview = document.querySelector('.lable-message');
        if (messagePreview) {
            messagePreview.textContent = `${latestNotification.message}`;
        }
    }
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', () => {
    const btnMessage = document.getElementById('btn-message');
    
    if (btnMessage) {
        btnMessage.addEventListener('click', fetchNotifications);
    }

    // Initial fetch
    fetchNotifications();

    // Periodic fetch
    setInterval(fetchNotifications, 30000);
});