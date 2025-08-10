const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Assignment = require('../models/assignment'); // adjust path if needed
const Course = require('../models/course');         // for course reference
const Group = require('../models/group');           // for group reference
const User = require('../models/user');             // for group createdBy

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Assignment.deleteMany();
  await Course.deleteMany();
  await Group.deleteMany();
  await User.deleteMany();
});

describe('Assignment Model Test Suite', () => {

  it('should create an assignment successfully with valid data', async () => {
    // Create dependencies
    const user = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'pass123', role: 'admin' });
    const course = await Course.create({ title: 'Node.js', videoUrl: 'http://example.com/video.mp4', uploadedBy: user._id });
    const group = await Group.create({ name: 'Batch 1', users: [], createdBy: user._id });

    const assignment = await Assignment.create({
      course: course._id,
      group: group._id
    });

    expect(assignment._id).toBeDefined();
    expect(assignment.course.toString()).toBe(course._id.toString());
    expect(assignment.group.toString()).toBe(group._id.toString());
    expect(assignment.assignedAt).toBeInstanceOf(Date);
  });

  it('should fail if course is missing', async () => {
    const user = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'pass123', role: 'admin' });
    const group = await Group.create({ name: 'Batch 1', createdBy: user._id });

    let err;
    try {
      await Assignment.create({
        group: group._id
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.course).toBeDefined();
  });

  it('should fail if group is missing', async () => {
    const user = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'pass123', role: 'admin' });
    const course = await Course.create({ title: 'Node.js', videoUrl: 'http://example.com/video.mp4', uploadedBy: user._id });

    let err;
    try {
      await Assignment.create({
        course: course._id
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.group).toBeDefined();
  });

  it('should set assignedAt to current date by default', async () => {
    const user = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'pass123', role: 'admin' });
    const course = await Course.create({ title: 'Node.js', videoUrl: 'http://example.com/video.mp4', uploadedBy: user._id });
    const group = await Group.create({ name: 'Batch 1', createdBy: user._id });

    const assignment = await Assignment.create({
      course: course._id,
      group: group._id
    });

    const now = new Date();
    expect(assignment.assignedAt).toBeInstanceOf(Date);
    expect(assignment.assignedAt.getDate()).toBe(now.getDate());
  });

});
