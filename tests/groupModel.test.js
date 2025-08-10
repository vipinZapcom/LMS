const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Group = require('../models/group'); // Adjust path if needed
const User = require('../models/user');   // Adjust path if needed

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Group.deleteMany();
  await User.deleteMany();
});

describe('Group Model', () => {
  it('should create a group successfully', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'pass123',
      role: 'admin',
    });

    const group = new Group({
      name: 'Test Group',
      users: [],
      createdBy: admin._id,
    });

    const savedGroup = await group.save();

    expect(savedGroup._id).toBeDefined();
    expect(savedGroup.name).toBe('Test Group');
    expect(savedGroup.createdBy.toString()).toBe(admin._id.toString());
  });

  it('should fail without a required name', async () => {
    const group = new Group({}); // no name

    let err;
    try {
      await group.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.name).toBeDefined();
  });

  it('should set createdAt by default', async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin2@example.com',
      password: 'pass123',
      role: 'admin',
    });

    const group = await Group.create({
      name: 'Group with Date',
      createdBy: admin._id,
    });

    expect(group.createdAt).toBeDefined();
    expect(group.createdAt).toBeInstanceOf(Date);
  });

  it('should store user references in users array', async () => {
    const user1 = await User.create({
      name: 'User 1',
      email: 'user1@example.com',
      password: 'pass123',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'User 2',
      email: 'user2@example.com',
      password: 'pass123',
      role: 'user',
    });

    const admin = await User.create({
      name: 'Admin',
      email: 'admin3@example.com',
      password: 'pass123',
      role: 'admin',
    });

    const group = await Group.create({
      name: 'Group with Users',
      users: [user1._id, user2._id],
      createdBy: admin._id,
    });

    expect(group.users.length).toBe(2);
    expect(group.users[0].toString()).toBe(user1._id.toString());
    expect(group.users[1].toString()).toBe(user2._id.toString());
  });

  it('should populate users and createdBy fields', async () => {
    const user1 = await User.create({
      name: 'User 1',
      email: 'user1pop@example.com',
      password: 'pass123',
      role: 'user',
    });

    const user2 = await User.create({
      name: 'User 2',
      email: 'user2pop@example.com',
      password: 'pass123',
      role: 'user',
    });

    const admin = await User.create({
      name: 'Admin Pop',
      email: 'adminpop@example.com',
      password: 'pass123',
      role: 'admin',
    });

    const group = await Group.create({
      name: 'Populated Group',
      users: [user1._id, user2._id],
      createdBy: admin._id,
    });

    // Populate both references
    const populatedGroup = await Group.findById(group._id)
      .populate('users')
      .populate('createdBy');

    // Check populated data
    expect(populatedGroup.users.length).toBe(2);
    expect(populatedGroup.users[0].name).toBe('User 1');
    expect(populatedGroup.users[1].name).toBe('User 2');
    expect(populatedGroup.createdBy.name).toBe('Admin Pop');
  });
});
