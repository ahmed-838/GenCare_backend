const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // For faster queries by userId
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        default: 'notifications-outline'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['general', 'appointment', 'medication', 'health', 'system'],
        default: 'general'
    },
    actionData: {
        // Optional data to perform actions when notification is clicked
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    expiresAt: {
        // Optional expiration date
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days from now
    }
}, { 
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            // Add a formatted time field for display
            const now = new Date();
            const createdAt = new Date(ret.createdAt);
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            
            if (diffDays > 0) {
                ret.time = `${diffDays}d ago`;
            } else if (diffHours > 0) {
                ret.time = `${diffHours}h ago`;
            } else if (diffMinutes > 0) {
                ret.time = `${diffMinutes}m ago`;
            } else {
                ret.time = 'Just now';
            }
            
            return ret;
        }
    }
});

// Index for querying unread notifications and sorting by creation date
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Clean up expired notifications periodically
notificationSchema.statics.cleanupExpired = async function() {
    const result = await this.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 