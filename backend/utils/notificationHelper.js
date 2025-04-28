const pool = require('../db/database');

async function createSystemNotification(userId, title, message) {
    try {
        const query = `
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, 'system', $2, $3)
            RETURNING *
        `;
        await pool.query(query, [userId, title, message]);
    } catch (error) {
        console.error('Error creating system notification:', error);
    }
}

async function createUserNotification(userId, triggerUserId, type, title, message) {
    try {
        const query = `
            INSERT INTO notifications (
                user_id, 
                trigger_user_id, 
                type, 
                title, 
                message
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        await pool.query(query, [userId, triggerUserId, type, title, message]);
    } catch (error) {
        console.error('Error creating user notification:', error);
    }
}

module.exports = {
    createSystemNotification,
    createUserNotification
}; 