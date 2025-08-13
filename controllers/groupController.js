const Group = require('../models/Group');

// Create group
exports.createGroup = async (req, res) => {
  try {
    const { name, members, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ message: 'Group name and createdBy are required' });
    }

    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(409).json({ message: 'Group already exists' });
    }

    const group = new Group({
      name,
      members: members || [],
      createdBy
    });

    await group.save();
    res.status(201).json({ message: 'Group created successfully', group });
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
};

// Get group by id
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group', error: error.message });
  }
};

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'name email');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups', error: error.message });
  }
};

// Delete entire group
exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    if (!groupId) {
      return res.status(400).json({ message: 'groupId is required' });
    }

    const deletedGroup = await Group.findByIdAndDelete(groupId);

    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group', error: error.message });
  }
};

// Delete user from group
exports.deleteUserFromGroup = async (req, res) => {
  try {
    const { groupid, userid } = req.params;

    const group = await Group.findById(groupid);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.members = group.members.filter(memberId => memberId.toString() !== userid);
    await group.save();

    res.status(200).json({ message: 'User removed from group', group });
  } catch (error) {
    res.status(500).json({ message: 'Error removing user from group', error: error.message });
  }
};