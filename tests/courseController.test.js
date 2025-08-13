const Course = require('../models/Course');
const courseController = require('../controllers/courseController');
const jwt = require('jsonwebtoken');

// Mock Course model
jest.mock('../models/Course');

// Mock jwt
jest.mock('jsonwebtoken');

// Helper to mock Express req/res
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Course Controller Unit Tests', () => {
  let req, res;
  const userId = 'mockUserId123';

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockResponse();
    // Mock JWT verification
    req = { headers: { authorization: 'Bearer fakeToken' } };
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { id: userId, email: 'test@example.com' });
    });
  });

  // ---------- CREATE COURSE ----------
  it('should create a course successfully', async () => {
    const courseData = { title: 'Course 1', duration: 5, instructor: 'John', videoUrl: 'http://video.com' };
    req.body = courseData;
    req.user = { id: userId };

    Course.prototype.save = jest.fn().mockResolvedValue({ ...courseData, uploadedBy: userId });

    await courseController.createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    expect(Course.prototype.save).toHaveBeenCalled();
  });

  it('should return 500 if save fails', async () => {
    req.body = { title: 'Course 1', duration: 5, instructor: 'John', videoUrl: 'http://video.com' };
    req.user = { id: userId };

    Course.prototype.save = jest.fn().mockRejectedValue(new Error('DB error'));

    await courseController.createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB error' });
  });

  // ---------- GET COURSE BY ID ----------
  it('should get course by id', async () => {
    const mockCourse = { _id: '1', title: 'Course 1', isDeleted: false };
    req.params = { id: '1' };
    Course.findById.mockResolvedValue(mockCourse);

    await courseController.getCourseById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCourse }));
  });

  it('should return 404 if course not found', async () => {
    req.params = { id: '1' };
    Course.findById.mockResolvedValue(null);

    await courseController.getCourseById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course not found' });
  });

  // ---------- GET ALL COURSES ----------
  it('should get all courses', async () => {
    const courses = [{ title: 'Course 1' }, { title: 'Course 2' }];
    Course.find.mockResolvedValue(courses);

    await courseController.getAllCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: courses }));
  });

  it('should handle getAllCourses DB error', async () => {
    Course.find.mockRejectedValue(new Error('DB error'));

    await courseController.getAllCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB error' });
  });

  // ---------- UPDATE COURSE ----------
  it('should update course if user is uploader', async () => {
    const mockCourse = { title: 'Old', uploadedBy: userId, save: jest.fn() };
    req.params = { id: '1' };
    req.body = { title: 'Updated' };
    req.user = { id: userId };
    Course.findById.mockResolvedValue(mockCourse);

    await courseController.updateCourse(req, res);

    expect(mockCourse.title).toBe('Updated');
    expect(mockCourse.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 403 if user is not uploader', async () => {
    const mockCourse = { title: 'Old', uploadedBy: 'otherUser' };
    req.params = { id: '1' };
    req.body = { title: 'Updated' };
    req.user = { id: userId };
    Course.findById.mockResolvedValue(mockCourse);

    await courseController.updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
  });

  // ---------- DELETE COURSE ----------
  it('should soft delete course if user is uploader', async () => {
    const mockCourse = { isDeleted: false, uploadedBy: userId, save: jest.fn() };
    req.params = { id: '1' };
    req.user = { id: userId };
    Course.findById.mockResolvedValue(mockCourse);

    await courseController.deleteCourse(req, res);

    expect(mockCourse.isDeleted).toBe(true);
    expect(mockCourse.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 403 if user is not uploader while deleting', async () => {
    const mockCourse = { uploadedBy: 'otherUser' };
    req.params = { id: '1' };
    req.user = { id: userId };
    Course.findById.mockResolvedValue(mockCourse);

    await courseController.deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
  });

  it('should assign course to groups successfully', async () => {
    req = { body: { courseId: 'course1', groupIds: ['group1', 'group2'] } };
    const courseMock = { assignedGroups: [], save: jest.fn().mockResolvedValue(true) };
    Course.findById.mockResolvedValue(courseMock);

    await assignCourseToGroups(req, res);

    expect(courseMock.assignedGroups).toEqual(['group1', 'group2']);
    expect(courseMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('should prevent duplicate group assignment', async () => {
    req = { body: { courseId: 'course1', groupIds: ['group1', 'group2'] } };
    const courseMock = { assignedGroups: ['group1'], save: jest.fn().mockResolvedValue(true) };
    Course.findById.mockResolvedValue(courseMock);

    await assignCourseToGroups(req, res);

    expect(courseMock.assignedGroups).toEqual(['group1', 'group2']);
    expect(courseMock.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if courseId or groupIds missing', async () => {
    req = { body: { groupIds: ['group1'] } };

    await assignCourseToGroups(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'courseId and groupIds array are required' });
  });

  it('should return 404 if course not found', async () => {
    req = { body: { courseId: 'course1', groupIds: ['group1'] } };
    Course.findById.mockResolvedValue(null);

    await assignCourseToGroups(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Course not found' });
  });

  it('should handle DB errors', async () => {
    req = { body: { courseId: 'course1', groupIds: ['group1'] } };
    Course.findById.mockRejectedValue(new Error('DB error'));

    await assignCourseToGroups(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB error' });
  });
});