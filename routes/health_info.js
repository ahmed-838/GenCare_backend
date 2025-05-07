const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const HealthInfo = require('../models/HealthInfo');
const { body, validationResult } = require('express-validator');

// Get health info
router.get('/', authMiddleware, async (req, res) => {
    try {
        const healthInfo = await HealthInfo.findOne({ userId: req.userId });
        if (!healthInfo) {
            return res.status(404).json({ error: 'Health info not found' });
        }

        res.status(200).json(healthInfo);
    } catch (error) {
        console.error('Error fetching health info:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create health info
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { healthInfo } = req.body;
        
        // التحقق من وجود بيانات صحية للمستخدم
        const existingHealthInfo = await HealthInfo.findOne({ userId: req.userId });
        if (existingHealthInfo) {
            return res.status(400).json({ error: 'Health info already exists for this user' });
        }
        
        console.log('Creating health info for user:', req.userId, 'with data:', healthInfo);
        
        const newHealthInfo = await HealthInfo.create({ 
            userId: req.userId, 
            healthInfo: {
                bloodPressure: healthInfo.bloodPressure || '',
                bloodSugar: healthInfo.bloodSugar || '',
                weight: healthInfo.weight || '',
                symptoms: healthInfo.symptoms || '',
            } 
        });
        
        res.status(201).json(newHealthInfo);
    } catch (error) {
        console.error('Error creating health info:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update health info
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { healthInfo } = req.body;
        console.log('Updating health info for user:', req.userId, 'with data:', healthInfo);
        
        // التحقق من وجود بيانات صحية للمستخدم
        let updatedHealthInfo = await HealthInfo.findOneAndUpdate(
            { userId: req.userId }, 
            { healthInfo: {
                bloodPressure: healthInfo.bloodPressure || '',
                bloodSugar: healthInfo.bloodSugar || '',
                weight: healthInfo.weight || '',
                symptoms: healthInfo.symptoms || '',
            } }, 
            { new: true }
        );
        
        // إذا لم تكن البيانات موجودة، قم بإنشائها
        if (!updatedHealthInfo) {
            updatedHealthInfo = await HealthInfo.create({ 
                userId: req.userId, 
                healthInfo: {
                    bloodPressure: healthInfo.bloodPressure || '',
                    bloodSugar: healthInfo.bloodSugar || '',
                    weight: healthInfo.weight || '',
                    symptoms: healthInfo.symptoms || '',
                } 
            });
        }
        
        console.log('Updated health info:', updatedHealthInfo);
        res.status(200).json(updatedHealthInfo);
    } catch (error) {
        console.error('Error updating health info:', error);
        res.status(500).json({ error: error.message });
    }
}); 

module.exports = router;