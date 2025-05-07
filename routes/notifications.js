// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for a user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            userId: req.userId 
        }).sort({ createdAt: -1 }); // Sort by newest first
        
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/notifications/unread
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread', authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: req.userId,
            isRead: false
        });
        
        res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/notifications
 * @desc    Create a notification (admin only)
 * @access  Private/Admin
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Check if admin or authorized to create notifications
        if (req.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to create notifications' });
        }

        const {
            userId,
            title,
            description,
            icon,
            type,
            actionData,
            expiresAt
        } = req.body;

        if (!userId || !title || !description) {
            return res.status(400).json({ error: 'userId, title and description are required' });
        }

        const newNotification = new Notification({
            userId,
            title,
            description,
            icon: icon || 'notifications-outline',
            type: type || 'general',
            actionData: actionData || null,
            expiresAt: expiresAt || undefined
        });

        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/notifications/self
 * @desc    Create a notification for the current user
 * @access  Private
 */
router.post('/self', authMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            icon,
            type,
            actionData,
            expiresAt
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const newNotification = new Notification({
            userId: req.userId, // Use the authenticated user's ID
            title,
            description,
            icon: icon || 'notifications-outline',
            type: type || 'general',
            actionData: actionData || null,
            expiresAt: expiresAt || undefined
        });

        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        console.error('Error creating self notification:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        // Ensure users can only update their own notifications
        if (notification.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to update this notification' });
        }
        
        notification.isRead = true;
        await notification.save();
        
        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.userId, isRead: false },
            { $set: { isRead: true } }
        );
        
        res.status(200).json({ 
            success: true, 
            message: `Marked ${result.modifiedCount} notifications as read` 
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        // Ensure users can only delete their own notifications
        if (notification.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this notification' });
        }
        
        await notification.deleteOne();
        
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for a user
 * @access  Private
 */
router.delete('/', authMiddleware, async (req, res) => {
    try {
        const result = await Notification.deleteMany({ userId: req.userId });
        
        res.status(200).json({ 
            success: true, 
            message: `Deleted ${result.deletedCount} notifications` 
        });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/notifications/bulk
 * @desc    Create multiple notifications (admin only)
 * @access  Private/Admin
 */
router.post('/bulk', authMiddleware, async (req, res) => {
    try {
        // Check if admin
        if (req.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to create bulk notifications' });
        }

        const { notifications } = req.body;
        
        if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
            return res.status(400).json({ error: 'Valid notifications array is required' });
        }

        const createdNotifications = await Notification.insertMany(notifications);
        
        res.status(201).json({
            success: true,
            count: createdNotifications.length,
            notifications: createdNotifications
        });
    } catch (error) {
        console.error('Error creating bulk notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 