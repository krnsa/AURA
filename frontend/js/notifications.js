import { supabase } from './supabaseClient.js';

// Get authentication token
function getToken() {
    const token = localStorage.getItem('authToken');
    return token;
}

async function fetchNotifications() {
    try {
        const token = getToken();
        if (!token) {
            console.error('No authentication token found');
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('/api/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching notifications: ${response.status}`);
        }

        const data = await response.json();
        
        // Update UI with notifications
        updateNotificationCount(data.notifications?.filter(n => !n.read).length || 0);
        if (data.notifications?.length > 0) {
            updateNotificationContent(data.notifications);
        } else {
            showEmptyState();
        }

    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        showErrorState(error.message);
    }
}

async function markNotificationAsRead(notificationId) {
    try {
        const token = getToken();
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error marking notification as read: ${response.status}`);
        }

        // Refresh notifications after marking as read
        fetchNotifications();

    } catch (error) {
        console.error('Error marking notification as read:', error.message);
    }
}

function createNotificationElement(notification) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'notification-item';
    if (!notification.read) {
        notificationDiv.classList.add('unread');
    }

    notificationDiv.innerHTML = `
        <div class="notice-content">
            <div class="username">${notification.from_user}</div>
            <div class="message">${notification.message}</div>
            <div class="timestamp">${new Date(notification.created_at).toLocaleString()}</div>
        </div>
    `;

    // Add click handler to mark as read
    notificationDiv.addEventListener('click', () => {
        markNotificationAsRead(notification.notification_id);
    });

    return notificationDiv;
}

function updateNotificationContent(notifications) {
    if (!notifications?.length) return;

    const isNotificationPage = window.location.pathname.includes('notification.html');
    
    if (isNotificationPage) {
        // Update main notifications list
        const notificationsList = document.querySelector('.notifications-list');
        if (notificationsList) {
            notificationsList.innerHTML = '';
            notifications.forEach(notification => {
                notificationsList.appendChild(createNotificationElement(notification));
            });
        }
    } else {
        // Update preview panel for other pages
        let notificationsPanel = document.querySelector('.notifications-panel');
        if (!notificationsPanel) {
            notificationsPanel = document.createElement('div');
            notificationsPanel.className = 'notifications-panel';
            document.body.appendChild(notificationsPanel);
        }

        notificationsPanel.innerHTML = '';
        
        const unreadNotifications = notifications.filter(n => !n.read);
        const notificationsToShow = unreadNotifications.slice(0, 5);
        
        notificationsToShow.forEach(notification => {
            notificationsPanel.appendChild(createNotificationElement(notification));
        });

        if (unreadNotifications.length > 5) {
            const viewAllButton = document.createElement('div');
            viewAllButton.className = 'notification-item view-all';
            viewAllButton.innerHTML = '<div class="notice-content">View all notifications</div>';
            viewAllButton.addEventListener('click', () => {
                window.location.href = '/notification.html';
            });
            notificationsPanel.appendChild(viewAllButton);
        }
    }

    // Update notification count
    updateNotificationCount(notifications.filter(n => !n.read).length);
}

function updateNotificationCount(count) {
    // Update notification icon in navigation
    const navNotificationLink = document.querySelector('.menu a[href="/notification.html"]');
    if (navNotificationLink && count > 0) {
        let badge = navNotificationLink.querySelector('.notification-count');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'notification-count';
            navNotificationLink.appendChild(badge);
        }
        badge.textContent = count;
    } else if (navNotificationLink && count === 0) {
        const badge = navNotificationLink.querySelector('.notification-count');
        if (badge) {
            badge.remove();
        }
    }
}

function showEmptyState() {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
                 stroke="currentColor" class="size-12">
                <path stroke-linecap="round" stroke-linejoin="round" 
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
            </svg>
            <p>No notifications yet</p>
        </div>`;
    }
}

function showErrorState(message) {
    const notificationsList = document.querySelector('.notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = `
        <div class="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="size-12">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <p>Something went wrong</p>
            <p class="error-message">${message}</p>
        </div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Set active menu item
    const notificationLink = document.querySelector('.menu a[href="/notification.html"]');
    if (window.location.pathname.includes('notification.html')) {
        notificationLink?.parentElement.classList.add('active');
    }

    // Handle notification button click
    const btnMessage = document.getElementById('btn-message');
    if (btnMessage) {
        btnMessage.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/notification.html';
        });
    }

    // Initial fetch
    fetchNotifications();

    // Periodic fetch every 30 seconds
    setInterval(fetchNotifications, 30000);
});