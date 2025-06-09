const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const request = require('supertest');

// Create in-memory MongoDB instance for testing
let mongoServer;

// Setup and teardown functions
const setupTestDB = async () => {
  // Make sure we're disconnected before starting
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Remove deprecated options
  await mongoose.connect(mongoUri);
};

const teardownTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Helper function to directly create user in the database
// Bypass the API validation checks for testing purposes
const createTestUser = async (userData) => {
  const User = require('../models/User');
  const user = new User(userData);
  await user.save();
  return user;
};

// Helper functions for tests
const registerUser = async (userData) => {
  return request(app)
    .post('/api/signup')
    .send(userData);
};

const loginUser = async (credentials) => {
  return request(app)
    .post('/api/login')
    .send(credentials);
};

// Set the test environment
process.env.NODE_ENV = 'test';

// Export utilities
module.exports = {
  setupTestDB,
  teardownTestDB,
  registerUser,
  loginUser,
  createTestUser,
  request,
  app
}; 