const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Course = require('../models/course'); // update path if different
const User = require('../models/user'); // needed for ref

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Course.deleteMany();
  await User.deleteMany();
});

describe('Course Model Test Suite', () => {
  
  it('should create a course successfully with all fields', async () => {
    const user = await User.create({ name: 'John', email: 'john@example.com', password: '123456', role: 'admin' });

    const course = await Course.create({
      title: 'Node.js Basics',
      description: 'Learn the basics of Node.js',
      videoUrl: 'http://example.com/video.mp4',
      uploadedBy: user._id
    });

    expect(course._id).toBeDefined();
    expect(course.title).toBe('Node.js Basics');
    expect(course.description).toBe('Learn the basics of Node.js');
    expect(course.videoUrl).toBe('http://example.com/video.mp4');
    expect(course.uploadedBy.toString()).toBe(user._id.toString());
    expect(course.createdAt).toBeInstanceOf(Date);
  });

  it('should fail if title is missing', async () => {
    let err;
    try {
      await Course.create({
        description: 'No title here',
        videoUrl: 'http://example.com/video.mp4'
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.title).toBeDefined();
  });

  it('should fail if videoUrl is missing', async () => {
    let err;
    try {
      await Course.create({
        title: 'Missing Video URL',
        description: 'This course has no video URL'
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.videoUrl).toBeDefined();
  });

  it('should allow description to be optional', async () => {
    const course = await Course.create({
      title: 'No Description Course',
      videoUrl: 'http://example.com/video.mp4'
    });
    expect(course.description).toBeUndefined();
  });

  it('should set createdAt to current date by default', async () => {
    const course = await Course.create({
      title: 'Date Test',
      videoUrl: 'http://example.com/video.mp4'
    });
    const now = new Date();
    expect(course.createdAt).toBeInstanceOf(Date);
    expect(course.createdAt.getDate()).toBe(now.getDate());
  });

});