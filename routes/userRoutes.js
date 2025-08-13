const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');

// User Signup & Login
router.post('/signup', userController.signup);
router.post('/login', userController.login);

// Protected User Routes
router.get('/detail/:id', verifyToken, userController.getUserById);
router.get('/detail', verifyToken, userController.getAllUsers);
router.put('/update/:id', verifyToken, userController.updateUser);
router.delete('/delete/:id', verifyToken, userController.deactivateUser);

module.exports = router;
