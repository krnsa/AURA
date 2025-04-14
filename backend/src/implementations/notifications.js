import { db } from '../database/database.js';

async function getNotifications(username) {
    try {
        // Get user's ID first
        const userQuery = await db.query(
            'SELECT user_id FROM users WHERE username = $1',
            [username]
        );

        if (userQuery.rows.length === 0) {
            return { error: 'User not found' };
        }

        const userId = userQuery.rows[0].user_id;

        // Get notifications
        const notificationQuery = await db.query(
            `SELECT 
                n.notification_id,
                n.type,
                n.message,
                n.created_at,
                n.read,
                u.username as from_user
            FROM notifications n
            LEFT JOIN users u ON n.from_user_id = u.user_id
            WHERE n.to_user_id = $1
            ORDER BY n.created_at DESC`,
            [userId]
        );

        return {
            success: true,
            notifications: notificationQuery.rows
        };
    } catch (error) {
        console.error('Error in getNotifications:', error);
        return { error: 'Failed to fetch notifications' };
    }
}

export default getNotifications;