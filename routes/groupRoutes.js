const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create group
router.post('/api/group/create', groupController.createGroup);

// Get all groups
router.get('/api/group/getAll', groupController.getAllGroups);

// Delete group
router.delete('/api/group/delete', groupController.deleteGroup);

// Delete user from group
router.delete('/api/group/delete/:groupid/:userid', groupController.deleteUserFromGroup);

module.exports = router;