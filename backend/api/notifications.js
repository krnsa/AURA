const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../db/database');

// GET /api/notifications - Fetch user's notifications
router.get('/notifications', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const query = `
            SELECT 
                n.id,
                n.type,
                n.title,
                n.message,
                n.created_at,
                n.read,
                u.username as trigger_user_name,
                u.avatar as trigger_user_avatar
            FROM notifications n
            LEFT JOIN users u ON n.trigger_user_id = u.id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC
            LIMIT 50
        `;

        const result = await pool.query(query, [userId]);
        
        const notifications = result.rows.map(notification => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            created_at: notification.created_at,
            read: notification.read,
            trigger_user: notification.trigger_user_name ? {
                username: notification.trigger_user_name,
                avatar: notification.trigger_user_avatar
            } : null
        }));

        res.json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// POST /api/notifications/:id/read - Mark notification as read
router.post('/notifications/:id/read', auth, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;

        const query = `
            UPDATE notifications 
            SET read = true 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;

        const result = await pool.query(query, [notificationId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// POST /api/notifications/create - Create a new notification (internal use)
router.post('/notifications/create', auth, async (req, res) => {
    try {
        const { user_id, type, title, message, trigger_user_id } = req.body;

        const query = `
            INSERT INTO notifications (
                user_id, 
                type, 
                title, 
                message, 
                trigger_user_id, 
                created_at
            ) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
            RETURNING *
        `;

        const result = await pool.query(query, [
            user_id,
            type,
            title,
            message,
            trigger_user_id
        ]);

        res.status(201).json({ notification: result.rows[0] });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

module.exports = router; 