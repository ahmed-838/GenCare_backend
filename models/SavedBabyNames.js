

const mongoose = require('mongoose');

const babyNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true
  },
  meaning: String
});

const savedBabyNamesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  letter: {
    type: String,
    required: true
  },
  names: [babyNameSchema],
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// إنشاء فهرس مركب للتأكد من عدم وجود تكرار
savedBabyNamesSchema.index({ userId: 1, letter: 1 }, { unique: true });

const SavedBabyNames = mongoose.model('SavedBabyNames', savedBabyNamesSchema, 'saved_baby_names');

module.exports = SavedBabyNames;