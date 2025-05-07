const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const SavedDisease = require('../models/SavedDisease');
const mongoose = require('mongoose');

// الحصول على الأمراض المحفوظة
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching saved diseases for user:', req.userId);
    const savedDiseases = await SavedDisease.find({ userId: req.userId });
    console.log('Found saved diseases:', savedDiseases);
    res.status(200).json(savedDiseases);
  } catch (error) {
    console.error('Error fetching saved diseases:', error);
    res.status(500).json({ error: error.message });
  }
});

// حفظ مرض جديد
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { diseaseId, name } = req.body;
    console.log('Saving disease for user:', req.userId, 'Disease:', { diseaseId, name });
    
    if (!diseaseId || !name) {
      return res.status(400).json({ error: 'Disease ID and name are required' });
    }
    
    // التحقق من وجود المرض بالفعل
    const existingDisease = await SavedDisease.findOne({ 
      userId: req.userId, 
      diseaseId: diseaseId 
    });
    
    if (existingDisease) {
      console.log('Disease already saved:', existingDisease);
      return res.status(400).json({ error: 'Disease already saved' });
    }
    
    const newSavedDisease = await SavedDisease.create({
      userId: req.userId,
      diseaseId: diseaseId,
      name: name
    });
    
    console.log('Disease saved successfully:', newSavedDisease);
    res.status(201).json(newSavedDisease);
  } catch (error) {
    console.error('Error saving disease:', error);
    res.status(500).json({ error: error.message });
  }
});

// حذف مرض محفوظ
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting disease for user:', req.userId, 'Disease ID:', id);
    
    const deletedDisease = await SavedDisease.findOneAndDelete({
      userId: req.userId,
      diseaseId: id
    });
    
    if (!deletedDisease) {
      console.log('Saved disease not found');
      return res.status(404).json({ error: 'Saved disease not found' });
    }
    
    console.log('Disease deleted successfully:', deletedDisease);
    res.status(200).json({ message: 'Disease removed from saved items' });
  } catch (error) {
    console.error('Error deleting saved disease:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 