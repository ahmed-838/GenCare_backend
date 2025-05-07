const mongoose = require('mongoose');

const savedDiseaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diseaseId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

// إنشاء فهرس مركب للتأكد من عدم وجود تكرار
savedDiseaseSchema.index({ userId: 1, diseaseId: 1 }, { unique: true });

const SavedDisease = mongoose.model('SavedDisease', savedDiseaseSchema, 'saved_diseases');

module.exports = SavedDisease; 