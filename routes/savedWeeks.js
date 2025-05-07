const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const SavedWeek = require('../models/SavedWeeks');

// الحصول على الأسابيع المحفوظة
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching saved weeks for user:', req.userId);
    const savedWeeks = await SavedWeek.find({ userId: req.userId }).sort({ week: 1 });
    console.log('Found saved weeks:', savedWeeks);
    res.status(200).json(savedWeeks);
  } catch (error) {
    console.error('Error fetching saved weeks:', error);
    res.status(500).json({ error: error.message });
  }
});

// حفظ أسبوع جديد
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { week } = req.body;
    console.log('Saving week for user:', req.userId, 'Week:', week);
    
    if (!week) {
      return res.status(400).json({ error: 'Week number is required' });
    }
    
    // التحقق من وجود الأسبوع بالفعل
    const existingWeek = await SavedWeek.findOne({ 
      userId: req.userId, 
      week: week 
    });
    
    if (existingWeek) {
      console.log('Week already saved:', existingWeek);
      return res.status(400).json({ error: 'Week already saved' });
    }
    
    const newSavedWeek = await SavedWeek.create({
      userId: req.userId,
      week: week
    });
    
    console.log('Week saved successfully:', newSavedWeek);
    res.status(201).json(newSavedWeek);
  } catch (error) {
    console.error('Error saving week:', error);
    res.status(500).json({ error: error.message });
  }
});

// حذف أسبوع محفوظ
router.delete('/:week', authMiddleware, async (req, res) => {
  try {
    const { week } = req.params;
    console.log('Deleting week for user:', req.userId, 'Week:', week);
    
    const deletedWeek = await SavedWeek.findOneAndDelete({
      userId: req.userId,
      week: week
    });
    
    if (!deletedWeek) {
      console.log('Saved week not found');
      return res.status(404).json({ error: 'Saved week not found' });
    }
    
    console.log('Week deleted successfully:', deletedWeek);
    res.status(200).json({ message: 'Week removed from saved items' });
  } catch (error) {
    console.error('Error deleting saved week:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

