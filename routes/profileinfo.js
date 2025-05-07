const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const PersonalInfo = require('../models/PersonalInfo');

// Get user data
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user, role: req.role });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get personal info
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log('Received request for user ID:', req.userId); // للتصحيح
        
        const personalInfo = await PersonalInfo.findOne({ userId: req.userId });
        console.log('Found personal info:', personalInfo); // للتصحيح
        
        if (!personalInfo) {
            console.log('No personal info found, creating default'); // للتصحيح
            
            // إذا لم يتم العثور على معلومات شخصية، قم بإنشاء سجل جديد بالبيانات الافتراضية
            const user = await User.findById(req.userId);
            if (!user) {
                console.log('User not found'); // للتصحيح
                return res.status(404).json({ error: 'User not found' });
            }
            
            const defaultPersonalInfo = {
                userId: req.userId,
                personalInfo: {
                    fullName: user.name || '',
                    phone: user.phone || '',
                    age: null,
                    bloodType: null,
                    pregnancyWeek: null,
                    avatar: 'default.png'
                }
            };
            
            console.log('Creating default personal info:', defaultPersonalInfo); // للتصحيح
            const newPersonalInfo = await PersonalInfo.create(defaultPersonalInfo);
            console.log('Created new personal info:', newPersonalInfo); // للتصحيح
            
            return res.status(200).json(newPersonalInfo);
        }
        
        console.log('Sending personal info response'); // للتصحيح
        res.status(200).json(personalInfo);
    } catch (error) {
        console.error('Error in GET /api/profileinfo:', error); // للتصحيح
        res.status(500).json({ error: error.message });
    }
});

// Create personal info
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { personalInfo } = req.body;
        if (!personalInfo || !personalInfo.fullName || !personalInfo.phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const userMetaData = await PersonalInfo.create({ userId: req.userId, personalInfo });
        res.status(201).json(userMetaData);
    } catch (error) {
        console.error('Error creating user personal info data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update personal info
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { personalInfo } = req.body;
        
        // تخفيف شروط التحقق للسماح بتحديث الصورة فقط
        if (!personalInfo) {
            return res.status(400).json({ error: 'Missing personal info data' });
        }

        // البحث عن الـ PersonalInfo باستخدام الـ userId
        let userMetaData = await PersonalInfo.findOne({ userId: req.userId });
        
        if (!userMetaData) {
            // إذا لم يتم العثور على معلومات المستخدم، قم بإنشاء سجل جديد
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // إنشاء سجل جديد بالبيانات المقدمة
            userMetaData = await PersonalInfo.create({ 
                userId: req.userId, 
                personalInfo: {
                    fullName: user.name || personalInfo.fullName || '',
                    phone: user.phone || personalInfo.phone || '',
                    age: personalInfo.age || null,
                    bloodType: personalInfo.bloodType || null,
                    pregnancyWeek: personalInfo.pregnancyWeek || null,
                    avatar: personalInfo.avatar || 'default'
                }
            });
        } else {
            // تحديث السجل الموجود
            // دمج البيانات الحالية مع البيانات الجديدة
            const updatedInfo = {
                ...userMetaData.personalInfo,
                ...personalInfo
            };
            
            userMetaData = await PersonalInfo.findOneAndUpdate(
                { userId: req.userId },
                { personalInfo: updatedInfo },
                { new: true }
            );
        }

        res.status(200).json(userMetaData);
    } catch (error) {
        console.error('Error updating user personal info data:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;