import { supabase } from './supabaseClient.js';

async function fetchNotifications() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('No user logged in');
            return;
        }

        // Fetch unread notifications first
        const { data: unreadNotifications, error: unreadError } = await supabase
            .from('notifications')
            .select(`
                *,
                from_user:users!notifications_from_user_id_fkey(username)
            `)
            .eq('to_user_id', user.id)
            .eq('read', false)
            .order('created_at', { ascending: false });

        if (unreadError) throw unreadError;

        // Update UI with unread notifications
        updateNotificationCount(unreadNotifications?.length || 0);
        if (unreadNotifications?.length > 0) {
            updateNotificationContent(unreadNotifications);
        }

    } catch (error) {
        console.error('Error fetching notifications:', error.message);
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        if (error) throw error;

        // Refresh notifications after marking as read
        fetchNotifications();

    } catch (error) {
        console.error('Error marking notification as read:', error.message);
    }
}

function createNotificationElement(notification) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'notification-item';
    notificationDiv.innerHTML = `
        <div class="notice-content">
            <div class="username">${notification.from_user.username}</div>
            <div class="message">${notification.message}</div>
            <div class="timestamp">${new Date(notification.created_at).toLocaleString()}</div>
        </div>
    `;

    // Add click handler to mark as read
    notificationDiv.addEventListener('click', () => {
        markNotificationAsRead(notification.id);
    });

    return notificationDiv;
}

function updateNotificationContent(notifications) {
    if (!notifications?.length) return;

    const latestNotification = notifications[0];
    
    // Update button preview
    const usernameElement = document.querySelector('.username');
    const messagePreview = document.querySelector('.label-message');
    
    if (usernameElement) {
        usernameElement.textContent = latestNotification.from_user.username;
    }
    if (messagePreview) {
        messagePreview.textContent = 'New Messages';
    }

    // Create notifications panel if doesn't exist
    let notificationsPanel = document.querySelector('.notifications-panel');
    if (!notificationsPanel) {
        notificationsPanel = document.createElement('div');
        notificationsPanel.className = 'notifications-panel';
        document.body.appendChild(notificationsPanel);
    }

    // Clear and update notifications panel
    notificationsPanel.innerHTML = '';
    notifications.forEach(notification => {
        notificationsPanel.appendChild(createNotificationElement(notification));
    });
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', () => {
    const btnMessage = document.getElementById('btn-message');
    
    if (btnMessage) {
        btnMessage.addEventListener('click', () => {
            const panel = document.querySelector('.notifications-panel');
            if (panel) {
                panel.classList.toggle('show');
            }
            fetchNotifications();
        });
    }

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#btn-message') && !e.target.closest('.notifications-panel')) {
            const panel = document.querySelector('.notifications-panel');
            if (panel) {
                panel.classList.remove('show');
            }
        }
    });

    // Initial fetch
    fetchNotifications();

    // Periodic fetch every 30 seconds
    setInterval(fetchNotifications, 30000);
});