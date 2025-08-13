const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create group
router.post('/create', groupController.createGroup);

// Get group by id
router.get('/get/:id', groupController.getGroupById);

// Get all groups
router.get('/getAll', groupController.getAllGroups);

// Delete group
router.delete('/delete/:id', groupController.deleteGroup);

// Delete user from group
router.delete('/delete/:groupid/:userid', groupController.deleteUserFromGroup);

module.exports = router;