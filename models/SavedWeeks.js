const mongoose = require('mongoose');

const savedWeekSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  week: {
    type: String,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// إنشاء فهرس مركب للتأكد من عدم وجود تكرار
savedWeekSchema.index({ userId: 1, week: 1 }, { unique: true });

const SavedWeek = mongoose.model('SavedWeek', savedWeekSchema, 'saved_weeks');

module.exports = SavedWeek;
