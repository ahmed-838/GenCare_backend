const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

// تكوين المسارات
const testImagePath = path.join(__dirname, 'uploads', 'test_image2.jpg');
const MODEL_API_URL = 'http://16.171.139.253/api/predict';

// اختبار الاتصال المباشر بنموذج EC2
async function testModelAPI() {
  console.log('بدء اختبار الاتصال بنموذج EC2...');

  try {
    // إنشاء FormData
    const formData = new FormData();
    
    // إضافة الملف
    const fileStream = fs.createReadStream(testImagePath);
    formData.append('file', fileStream);
    
    console.log(`إرسال الطلب إلى: ${MODEL_API_URL}`);
    
    // إرسال الطلب
    const response = await axios.post(MODEL_API_URL, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    // عرض النتائج
    console.log('استجابة نموذج EC2:', response.status);
    console.log('بيانات الاستجابة:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('خطأ في الاتصال بنموذج EC2:', error.message);
    
    if (error.response) {
      console.error('بيانات الاستجابة:', error.response.data);
      console.error('حالة الاستجابة:', error.response.status);
    } else if (error.request) {
      console.error('لم يتم استلام استجابة');
    }
    
    return null;
  }
}

// التنفيذ
testModelAPI()
  .then(result => {
    if (result) {
      console.log('تم الاختبار بنجاح!');
    } else {
      console.error('فشل الاختبار!');
    }
  }); 