const pool = require('../db/database');
const auth = require('../middleware/auth');

async function createNotification(req, res) {
    try {
        const { user_id, type, title, message, trigger_user_id } = req.body;

        // Validate notification type
        const validTypes = ['like', 'comment', 'follow', 'message', 'system'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification type'
            });
        }

        // Validate required fields
        if (!user_id || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

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

        res.status(201).json({ 
            success: true, 
            notification: result.rows[0] 
        });
    } catch (error) {
        console.error('Error in createNotification:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error while creating notification' 
        });
    }
}

module.exports = {
    path: '/api/notifications',
    method: 'POST',
    handler: [auth, createNotification]
}; 