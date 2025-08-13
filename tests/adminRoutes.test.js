const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/user');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('Admin Model Test Suite', () => {
  
  it('should create an admin user successfully', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'pass123',
      role: 'admin'
    });

    expect(admin._id).toBeDefined();
    expect(admin.role).toBe('admin');
    expect(admin.email).toBe('admin@example.com');
  });

  it('should fail if required fields are missing', async () => {
    let err;
    try {
      await User.create({ email: 'admin@example.com' }); // Missing name & password
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should not allow duplicate email for admin', async () => {
    await User.create({
      name: 'Admin One',
      email: 'admin@example.com',
      password: 'pass123',
      role: 'admin'
    });

    let err;
    try {
      await User.create({
        name: 'Admin Two',
        email: 'admin@example.com',
        password: 'pass456',
        role: 'admin'
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // Mongo duplicate key error
  });

  it('should update admin details successfully', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'pass123',
      role: 'admin'
    });

    admin.name = 'Updated Admin';
    const updatedAdmin = await admin.save();

    expect(updatedAdmin.name).toBe('Updated Admin');
  });

  it('should mark an admin as inactive (soft delete)', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'pass123',
      role: 'admin',
      isActive: true
    });

    admin.isActive = false;
    await admin.save();

    const found = await User.findById(admin._id);
    expect(found.isActive).toBe(false);
  });

});