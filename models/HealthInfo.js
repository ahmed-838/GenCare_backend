const mongoose = require('mongoose');

const healthInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    healthInfo: {
        bloodPressure: {
            type: String,
            default: '',
        },
        bloodSugar: {
            type: String,
            default: '',
        },
        weight: {
            type: String,
            default: '',
        },
        symptoms: {
            type: String,
            default: '',
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// تحديث تاريخ التعديل قبل الحفظ
healthInfoSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

healthInfoSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const HealthInfo = mongoose.model('HealthInfo', healthInfoSchema, 'health_info');

module.exports = HealthInfo;