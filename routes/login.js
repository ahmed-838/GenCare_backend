// routes/login.js
const express = require('express');
const router = express.Router();
const loginValidation = require('../utils/login_validation');
const User = require('../models/User');
const { generateToken } = require('../service/create_jwt');


router.post('/', loginValidation, async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier },
            ],
        });

        if (!user) {
            return res.status(400).json({ error: 'Phone or Email is incorrect' });
        }

        if (user.password !== password) {
            return res.status(400).json({ error: 'Password is incorrect' });
        }

        // create the token and save it in the cookie
        const token = generateToken(res, user._id);

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;