const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Admin Signup & Login
router.post('/signup', adminController.adminSignup);
router.post('/login', adminController.adminLogin);

// Protected Admin Routes
router.get('/detail/:id', verifyToken, verifyAdmin, adminController.getUserById);
router.put('/update/:id', verifyToken, verifyAdmin, adminController.updateUserById);
router.delete('/delete/:id', verifyToken, verifyAdmin, adminController.deleteUserById);

module.exports = router;
