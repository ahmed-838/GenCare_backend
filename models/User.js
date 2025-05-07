// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        length: 11,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user',
    },
}, { timestamps: true });



const User = mongoose.model('User', userSchema);

module.exports = User;