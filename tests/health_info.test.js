const { app, request, setupTestDB, teardownTestDB, createTestUser } = require('./testSetup');
const User = require('../models/User');
const HealthInfo = require('../models/HealthInfo');
const jwt = require('jsonwebtoken');

let authToken;
let userId;
let testUser;

beforeAll(async () => {
  await setupTestDB();

  // Create a test user directly in the database
  const userData = {
    name: 'Health Test User',
    email: 'health@example.com',
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

describe('Health Info Route Tests', () => {
  beforeEach(async () => {
    // Clean up before each test
    await HealthInfo.deleteMany({});
  });

  test('should add health information for authenticated user', async () => {
    const healthData = {
      weight: 65,
      height: 170,
      bloodType: 'A+',
      allergies: ['Peanuts', 'Dust'],
      chronicDiseases: ['Asthma']
    };

    const res = await request(app)
      .post('/api/healthInfo')
      .set('Authorization', `Bearer ${authToken}`)
      .send(healthData);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Health information saved successfully');
    expect(res.body.healthInfo).toHaveProperty('weight', 65);
    expect(res.body.healthInfo).toHaveProperty('height', 170);
  });

  test('should get health information for authenticated user', async () => {
    // First add health info
    await HealthInfo.create({
      user: userId,
      weight: 70,
      height: 175,
      bloodType: 'O+',
      allergies: ['None'],
      chronicDiseases: ['None']
    });

    const res = await request(app)
      .get('/api/healthInfo')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('weight', 70);
    expect(res.body).toHaveProperty('height', 175);
    expect(res.body).toHaveProperty('bloodType', 'O+');
  });

  test('should update health information for authenticated user', async () => {
    // First add health info
    await HealthInfo.create({
      user: userId,
      weight: 70,
      height: 175,
      bloodType: 'O+',
      allergies: ['None'],
      chronicDiseases: ['None']
    });

    const updatedData = {
      weight: 72,
      height: 175,
      bloodType: 'O+'
    };

    const res = await request(app)
      .put('/api/healthInfo')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Health information updated successfully');
    expect(res.body.healthInfo).toHaveProperty('weight', 72);
  });

  test('should not access health info without authentication', async () => {
    const res = await request(app)
      .get('/api/healthInfo');
    
    expect(res.statusCode).toBe(401);
  });
}); 