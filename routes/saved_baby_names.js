const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const SavedBabyNames = require('../models/SavedBabyNames');

// الحصول على أسماء الأطفال المحفوظة
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching saved baby names for user:', req.userId);
    const savedBabyNames = await SavedBabyNames.find({ userId: req.userId }).sort({ letter: 1 });
    console.log('Found saved baby names:', savedBabyNames);
    res.status(200).json(savedBabyNames);
  } catch (error) {
    console.error('Error fetching saved baby names:', error);
    res.status(500).json({ error: error.message });
  }
});

// حفظ أسماء أطفال جديدة
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { letter, names } = req.body;
    console.log('Saving baby names for user:', req.userId, 'Letter:', letter);
    
    if (!letter || !names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ error: 'Letter and names array are required' });
    }
    
    // التحقق من وجود الحرف بالفعل
    let savedNames = await SavedBabyNames.findOne({ 
      userId: req.userId, 
      letter: letter 
    });
    
    if (savedNames) {
      // تحديث الأسماء الموجودة
      console.log('Letter already exists, updating names');
      
      // إضافة الأسماء الجديدة فقط
      const existingNameStrings = savedNames.names.map(n => n.name);
      const newNames = names.filter(n => !existingNameStrings.includes(n.name));
      
      if (newNames.length === 0) {
        return res.status(200).json(savedNames); // لا توجد أسماء جديدة للإضافة
      }
      
      savedNames.names = [...savedNames.names, ...newNames];
      savedNames.savedAt = new Date();
      await savedNames.save();
      
      console.log('Names updated successfully:', savedNames);
      return res.status(200).json(savedNames);
    }
    
    // إنشاء سجل جديد
    const newSavedNames = await SavedBabyNames.create({
      userId: req.userId,
      letter: letter,
      names: names
    });
    
    console.log('Baby names saved successfully:', newSavedNames);
    res.status(201).json(newSavedNames);
  } catch (error) {
    console.error('Error saving baby names:', error);
    res.status(500).json({ error: error.message });
  }
});

// حذف اسم طفل محفوظ
router.delete('/:letter/:name', authMiddleware, async (req, res) => {
  try {
    const { letter, name } = req.params;
    console.log('Deleting baby name for user:', req.userId, 'Letter:', letter, 'Name:', name);
    
    const savedNames = await SavedBabyNames.findOne({
      userId: req.userId,
      letter: letter
    });
    
    if (!savedNames) {
      console.log('Saved letter not found');
      return res.status(404).json({ error: 'Saved letter not found' });
    }
    
    // حذف الاسم من المصفوفة
    const initialLength = savedNames.names.length;
    savedNames.names = savedNames.names.filter(n => n.name !== name);
    
    if (savedNames.names.length === initialLength) {
      console.log('Name not found in saved names');
      return res.status(404).json({ error: 'Name not found in saved names' });
    }
    
    if (savedNames.names.length === 0) {
      // إذا لم تبق أسماء، احذف السجل بالكامل
      await SavedBabyNames.findByIdAndDelete(savedNames._id);
      console.log('No names left, removed letter completely');
    } else {
      // حفظ التغييرات
      await savedNames.save();
      console.log('Name removed successfully');
    }
    
    res.status(200).json({ message: 'Name removed from saved items' });
  } catch (error) {
    console.error('Error deleting saved baby name:', error);
    res.status(500).json({ error: error.message });
  }
});

// حذف حرف بالكامل
router.delete('/:letter', authMiddleware, async (req, res) => {
  try {
    const { letter } = req.params;
    console.log('Deleting all baby names for letter for user:', req.userId, 'Letter:', letter);
    
    const result = await SavedBabyNames.findOneAndDelete({
      userId: req.userId,
      letter: letter
    });
    
    if (!result) {
      console.log('Saved letter not found');
      return res.status(404).json({ error: 'Saved letter not found' });
    }
    
    console.log('Letter deleted successfully:', result);
    res.status(200).json({ message: 'Letter removed from saved items' });
  } catch (error) {
    console.error('Error deleting saved letter:', error);
    res.status(500).json({ error: error.message });
  }
});

// تحديث أسماء الأطفال (إضافة وحذف)
router.put('/update', authMiddleware, async (req, res) => {
  try {
    const { letter, names } = req.body;
    console.log('Updating baby names for user:', req.userId, 'Letter:', letter);
    
    if (!letter || !Array.isArray(names)) {
      return res.status(400).json({ error: 'Letter and names array are required' });
    }
    
    // البحث عن الحرف
    let savedNames = await SavedBabyNames.findOne({ 
      userId: req.userId, 
      letter: letter 
    });
    
    if (savedNames) {
      // إذا كانت قائمة الأسماء فارغة، قم بحذف الحرف بالكامل
      if (names.length === 0) {
        await SavedBabyNames.findByIdAndDelete(savedNames._id);
        console.log('No names left, removed letter completely');
        return res.status(200).json({ message: 'Letter removed from saved items' });
      }
      
      // تحديث الأسماء بالقائمة الجديدة بالكامل
      savedNames.names = names;
      savedNames.savedAt = new Date();
      await savedNames.save();
      
      console.log('Names updated successfully:', savedNames);
      return res.status(200).json(savedNames);
    } else if (names.length > 0) {
      // إنشاء سجل جديد إذا لم يكن الحرف موجودًا وكانت هناك أسماء
      const newSavedNames = await SavedBabyNames.create({
        userId: req.userId,
        letter: letter,
        names: names
      });
      
      console.log('Baby names saved successfully:', newSavedNames);
      return res.status(201).json(newSavedNames);
    }
    
    // إذا لم يكن الحرف موجودًا وكانت قائمة الأسماء فارغة
    return res.status(200).json({ message: 'No changes needed' });
    
  } catch (error) {
    console.error('Error updating baby names:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
