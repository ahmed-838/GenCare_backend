const { app, request, setupTestDB, teardownTestDB } = require('./testSetup');
const User = require('../models/User');

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

describe('Signup Route Tests', () => {
  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
  });

  test('should register a new user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/signup')
      .send(userData);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');

    // Verify the user was created in the database
    const user = await User.findOne({ email: 'john@example.com' });
    expect(user).not.toBeNull();
    expect(user.name).toBe('John Doe');
  });

  test('should not register a user with existing email', async () => {
    // First create a user
    await User.create({
      name: 'Existing User',
      email: 'existing@example.com',
      phone: '9876543210',
      password: 'password123'
    });

    // Try to register with the same email
    const res = await request(app)
      .post('/api/signup')
      .send({
        name: 'New User',
        email: 'existing@example.com',
        phone: '1234567890',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'email_already_exists');
  });

  test('should not register a user with existing phone', async () => {
    // First create a user
    await User.create({
      name: 'Existing User',
      email: 'something@example.com',
      phone: '9876543210',
      password: 'password123'
    });

    // Try to register with the same phone
    const res = await request(app)
      .post('/api/signup')
      .send({
        name: 'New User',
        email: 'new@example.com',
        phone: '9876543210',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'phone_already_exists');
  });

  test('should not register with missing required fields', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send({
        name: 'Incomplete User'
        // Missing email, phone, password
      });
    
    expect(res.statusCode).toBe(400);
  });
}); 