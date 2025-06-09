const { app, request, setupTestDB, teardownTestDB } = require('./testSetup');
const User = require('../models/User');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Login Route Tests', () => {
  beforeEach(async () => {
    // Create a test user before each test
    await User.create({
      email: 'test@example.com',
      phone: '1234567890',
      password: 'password123',
      name: 'Test User'
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
  });

  test('should login a user with valid email and password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        identifier: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  });

  test('should login a user with valid phone and password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        identifier: '1234567890',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('token');
  });

  test('should not login with incorrect identifier', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        identifier: 'wrong@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Phone or Email is incorrect');
  });

  test('should not login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        identifier: 'test@example.com',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Password is incorrect');
  });
}); 