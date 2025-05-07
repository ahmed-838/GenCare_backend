const express = require('express');
const router = express.Router();
const User = require('../models/User');
const signupValidation = require('../utils/signup_validation');
const identifier = require('../middleware/identifier');

router.post('/', signupValidation, identifier, async (req, res) => {
    try {
        const { name, phone, email, password } = req.body;
        
        const newUser = new User({ name, phone, email, password });
        
        await newUser.save();
        
        res.status(201).json({ message: 'User created successfully' });
        
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/', (req, res) => {
    res.send('Hello From the Signup Route');
});

module.exports = router;