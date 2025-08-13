const groupController = require('../controllers/groupController');
const Group = require('../models/Group');

// Mock Mongoose Model
jest.mock('../models/Group');

describe('Group Controller', () => {
  
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // --- Create Group ---
  describe('createGroup', () => {
    it('should return 400 if name or createdBy is missing', async () => {
      mockReq.body = { name: '' }; // missing createdBy
      await groupController.createGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group name and createdBy are required' });
    });

    it('should return 409 if group already exists', async () => {
      mockReq.body = { name: 'Test Group', createdBy: 'user1' };
      Group.findOne.mockResolvedValue({ name: 'Test Group' });
      await groupController.createGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group already exists' });
    });

    it('should create group successfully', async () => {
      mockReq.body = { name: 'New Group', createdBy: 'user1', members: [] };
      Group.findOne.mockResolvedValue(null);
      Group.prototype.save = jest.fn().mockResolvedValue({ name: 'New Group' });
      await groupController.createGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Group created successfully' }));
    });

    it('should handle errors when creating group', async () => {
      mockReq.body = { name: 'Error Group', createdBy: 'user1' };
      Group.findOne.mockRejectedValue(new Error('DB error'));
      await groupController.createGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error creating group' }));
    });
  });

  // --- Get All Groups ---
  describe('getAllGroups', () => {
    it('should return all groups', async () => {
      Group.find.mockReturnValue({ populate: jest.fn().mockResolvedValue([{ name: 'Group1' }]) });
      await groupController.getAllGroups(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([{ name: 'Group1' }]);
    });

    it('should handle errors when fetching groups', async () => {
      Group.find.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('DB error')) });
      await groupController.getAllGroups(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error fetching groups' }));
    });
  });

  // --- Delete Group ---
  describe('deleteGroup', () => {
    it('should return 400 if groupId missing', async () => {
      mockReq.body = {};
      await groupController.deleteGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'groupId is required' });
    });

    it('should return 404 if group not found', async () => {
      mockReq.body = { groupId: 'id1' };
      Group.findByIdAndDelete.mockResolvedValue(null);
      await groupController.deleteGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group not found' });
    });

    it('should delete group successfully', async () => {
      mockReq.body = { groupId: 'id1' };
      Group.findByIdAndDelete.mockResolvedValue({ _id: 'id1' });
      await groupController.deleteGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group deleted successfully' });
    });

    it('should handle errors during delete', async () => {
      mockReq.body = { groupId: 'id1' };
      Group.findByIdAndDelete.mockRejectedValue(new Error('DB error'));
      await groupController.deleteGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error deleting group' }));
    });
  });

  // --- Delete User From Group ---
  describe('deleteUserFromGroup', () => {
    it('should return 404 if group not found', async () => {
      mockReq.params = { groupid: 'g1', userid: 'u1' };
      Group.findById.mockResolvedValue(null);
      await groupController.deleteUserFromGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Group not found' });
    });

    it('should remove user from group successfully', async () => {
      mockReq.params = { groupid: 'g1', userid: 'u1' };
      const mockGroup = { members: ['u1', 'u2'], save: jest.fn() };
      Group.findById.mockResolvedValue(mockGroup);
      await groupController.deleteUserFromGroup(mockReq, mockRes);
      expect(mockGroup.members).toEqual(['u2']);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User removed from group' }));
    });

    it('should handle errors when removing user from group', async () => {
      mockReq.params = { groupid: 'g1', userid: 'u1' };
      Group.findById.mockRejectedValue(new Error('DB error'));
      await groupController.deleteUserFromGroup(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error removing user from group' }));
    });
  });

});