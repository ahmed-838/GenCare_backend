// service/notificationService.js
const Notification = require('../models/Notification');

/**
 * Creates a notification for a single user
 * @param {string} userId - The ID of the user to receive the notification
 * @param {string} title - The notification title
 * @param {string} description - The notification description
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} The created notification
 */
const createNotification = async (userId, title, description, options = {}) => {
    try {
        const { icon, type, actionData, expiresAt } = options;
        
        const notification = new Notification({
            userId,
            title,
            description,
            icon: icon || 'notifications-outline',
            type: type || 'general',
            actionData: actionData || null,
            expiresAt: expiresAt || undefined
        });
        
        return await notification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Creates the same notification for multiple users
 * @param {Array<string>} userIds - Array of user IDs to receive the notification
 * @param {string} title - The notification title
 * @param {string} description - The notification description
 * @param {Object} options - Additional options
 * @returns {Promise<Array<Object>>} The created notifications
 */
const createBulkNotifications = async (userIds, title, description, options = {}) => {
    try {
        const { icon, type, actionData, expiresAt } = options;
        
        const notifications = userIds.map(userId => ({
            userId,
            title,
            description,
            icon: icon || 'notifications-outline',
            type: type || 'general',
            actionData: actionData || null,
            expiresAt: expiresAt || undefined
        }));
        
        return await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        throw error;
    }
};

/**
 * Marks a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 * @param {string} userId - The ID of the user who owns the notification
 * @returns {Promise<Object>} The updated notification
 */
const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findById(notificationId);
        
        if (!notification) {
            throw new Error('Notification not found');
        }
        
        if (notification.userId.toString() !== userId) {
            throw new Error('Not authorized to update this notification');
        }
        
        notification.isRead = true;
        return await notification.save();
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

/**
 * Marks all notifications as read for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} The result of the update operation
 */
const markAllAsRead = async (userId) => {
    try {
        return await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

/**
 * Deletes expired notifications
 * @returns {Promise<Object>} The result of the delete operation
 */
const cleanupExpiredNotifications = async () => {
    try {
        return await Notification.cleanupExpired();
    } catch (error) {
        console.error('Error cleaning up expired notifications:', error);
        throw error;
    }
};

/**
 * Gets unread notification count for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<number>} The number of unread notifications
 */
const getUnreadCount = async (userId) => {
    try {
        return await Notification.countDocuments({ userId, isRead: false });
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    createBulkNotifications,
    markAsRead,
    markAllAsRead,
    cleanupExpiredNotifications,
    getUnreadCount
}; 