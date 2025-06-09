const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');

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
router.post('/analyze', express.raw({ type: 'multipart/form-data', limit: '10mb' }), async (req, res) => {
  console.log('استلام طلب تحليل صورة');
  console.log('Content-Type:', req.headers['content-type']);
  
  try {
    // استخدام busboy مباشرة للتعامل مع formdata من React Native
    const busboy = require('busboy');
    const bb = busboy({ headers: req.headers });
    
    let imageBuffer = null;
    let fileName = null;
    let mimeType = null;
    
    // عند استلام ملف
    bb.on('file', (name, file, info) => {
      console.log('استلام ملف:', name);
      console.log('معلومات الملف:', info);
      
      const chunks = [];
      file.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      file.on('end', () => {
        imageBuffer = Buffer.concat(chunks);
        fileName = info.filename;
        mimeType = info.mimeType;
        console.log('تم استلام الملف بالكامل. الحجم:', imageBuffer.length, 'بايت');
      });
    });
    
    // عند اكتمال المعالجة
    bb.on('finish', async () => {
      if (!imageBuffer) {
        console.error('لم يتم استلام أي صورة');
        return res.status(400).json({ success: false, error: 'No image uploaded' });
      }
      
      try {
        // إنشاء FormData لإرسال الملف
        const FormData = require('form-data');
        const formData = new FormData();
        
        // إضافة الصورة إلى FormData
        formData.append('file', imageBuffer, {
          filename: fileName || `image_${Date.now()}.jpg`,
          contentType: mimeType || 'image/jpeg'
        });
        
        console.log('جاري إرسال الصورة للتحليل...');
        
        // إرسال الصورة إلى خدمة التحليل
        const response = await axios.post(`${MODEL_API_URL}/api/predict`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('تم استلام الرد من خدمة التحليل');
        console.log('نوع الاستجابة:', typeof response.data);
        
        // إرسال الرد كما هو للتطبيق
        return res.status(200).json(response.data);
      } catch (error) {
        console.error('خطأ أثناء معالجة الصورة:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to process the image'
        });
      }
    });
    
    // إرسال البيانات إلى busboy
    bb.end(req.body);
    
  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error.message);
    console.error('تفاصيل الخطأ:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Failed to process the image'
    });
  }
});

module.exports = router; 