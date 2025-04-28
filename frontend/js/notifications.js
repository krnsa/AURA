import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    // Handle mark all as read
    const markAllReadButton = document.getElementById('mark-as-read');
    if (markAllReadButton) {
        markAllReadButton.addEventListener('click', () => {
            const unreadNotifications = document.querySelectorAll('.notificationCard.unread');
            unreadNotifications.forEach(notification => {
                notification.classList.remove('unread');
            });
            updateNotificationCount();
        });
    }

    // Handle individual notification clicks
    const notifications = document.querySelectorAll('.notificationCard');
    notifications.forEach(notification => {
        notification.addEventListener('click', () => {
            if (notification.classList.contains('unread')) {
                notification.classList.remove('unread');
                updateNotificationCount();
            }
        });
    });

    // Update notification count in the header
    function updateNotificationCount() {
        const unreadCount = document.querySelectorAll('.notificationCard.unread').length;
        const countElement = document.getElementById('num-of-notif');
        if (countElement) {
            countElement.textContent = unreadCount > 0 ? unreadCount : '';
        }
    }

    // Initial count update
    updateNotificationCount();
});