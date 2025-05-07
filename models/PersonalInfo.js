const mongoose = require('mongoose');
const User = require('./User');

const personalInfoSchema = new mongoose.Schema({
    
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    personalInfo: {
        type: Object,
        required: true,
        fullName: { 
            type: String, 
            required: true,
            default: function() {
                return this.userId.name // get the name from User model
            }
        },
        age: { type: Number,
             default: null 
            },
        phone: {
            type: String,
            required: true,
            default: function() {
                return this.userId.phone // get the phone from User model
            }
        },
        bloodType: { 
            type: String, 
            enum: ['A+','A-', 'B+','B-', 'AB+','AB-', 'O+','O-', null],
            default: null
        },
        pregnancyWeek: { type: Number,
             default: null
            },
        avatar: {
            type: String,
            default: "default"
        },
    },
    
});

// auto change in User model when PersonalInfo is updated
personalInfoSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate(); // جلب البيانات الجديدة
    if (update.personalInfo?.fullName) {
        const userId = this.getQuery().userId; // جلب الـ userId من الـ Query
        await User.findByIdAndUpdate(userId, {
            name: update.personalInfo.fullName
        });
    }
    next();
});

const PersonalInfo = mongoose.model('PersonalInfo', personalInfoSchema, 'personal_info');

module.exports = PersonalInfo;
