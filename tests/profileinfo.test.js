const { app, request, setupTestDB, teardownTestDB, createTestUser } = require('./testSetup');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

let authToken;
let userId;
let testUser;

beforeAll(async () => {
  await setupTestDB();

  // Create a test user directly in the database
  const userData = {
    name: 'Profile Test User',
    email: 'profile@example.com',
    phone: '1234567890',
    password: 'password123'
  };

  testUser = await createTestUser(userData);
  userId = testUser._id;
  
  // Create a token manually
  const secretKey = process.env.JWT_SECRET || 'testSecret';
  authToken = jwt.sign({ userId: testUser._id }, secretKey, { expiresIn: '1h' });
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Profile Info Route Tests', () => {
  test('should get user profile information', async () => {
    const res = await request(app)
      .get('/api/personalInfo')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Profile Test User');
    expect(res.body).toHaveProperty('email', 'profile@example.com');
    expect(res.body).toHaveProperty('phone', '1234567890');
  });

  test('should update user profile information', async () => {
    const updatedData = {
      name: 'Updated Profile Name',
      email: 'updated@example.com',
      phone: '9876543210'
    };

    const res = await request(app)
      .put('/api/personalInfo')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Profile updated successfully');
    
    // Verify the user was updated in the database
    const updatedUser = await User.findById(userId);
    expect(updatedUser.name).toBe('Updated Profile Name');
    expect(updatedUser.email).toBe('updated@example.com');
    expect(updatedUser.phone).toBe('9876543210');
  });

  test('should not access profile info without authentication', async () => {
    const res = await request(app)
      .get('/api/personalInfo');
    
    expect(res.statusCode).toBe(401);
  });

  test('should not update with invalid data', async () => {
    const invalidData = {
      email: 'notanemail' // Invalid email format
    };

    const res = await request(app)
      .put('/api/personalInfo')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidData);
    
    expect(res.statusCode).toBe(400);
  });
}); 