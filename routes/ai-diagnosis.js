const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Config for model inference service
const MODEL_API_URL = 'http://16.171.139.253/';

// Get available conditions from AI model
router.get('/conditions', async (req, res) => {
  try {
    const response = await axios.get(`${MODEL_API_URL}/api/conditions`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch conditions from AI service' 
    });
  }
});

// Check AI health status
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${MODEL_API_URL}/health`);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error checking AI health:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'AI service is not available' 
    });
  }
});

// Process ultrasound image for diagnosis
router.post('/analyze', upload.single('file'), async (req, res) => {
  console.log('استلام طلب تحليل صورة');
  
  try {
    // التحقق من وجود الصورة
    if (!req.file) {
      console.error('لم يتم تحميل أي ملف');
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    console.log('تم استلام الملف:', req.file.filename);

    const FormData = require('form-data');
    const formData = new FormData();
    
    // إرفاق الملف للإرسال
    const fileStream = fs.createReadStream(req.file.path);
    formData.append('file', fileStream, { filename: req.file.filename });
    
    console.log('جاري إرسال الصورة للتحليل...');
    
    // إرسال الصورة إلى خدمة التحليل
    const response = await axios.post(`${MODEL_API_URL}/api/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('تم استلام الرد من خدمة التحليل');
    
    // حذف الصورة المؤقتة
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('خطأ في حذف الملف المؤقت:', err);
      else console.log('تم حذف الملف المؤقت');
    });

    // إرسال الرد كما هو للتطبيق
    return res.status(200).json(response.data);
    
  } catch (error) {
    console.error('خطأ في معالجة الصورة:', error.message);
    
    // حذف الصورة المؤقتة إذا وجدت
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('خطأ في حذف الملف المؤقت:', err);
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process the image'
    });
  }
});

module.exports = router; 