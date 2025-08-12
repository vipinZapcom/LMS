const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Admin Signup & Login
router.post('/login/admin/signup', adminController.adminSignup);
router.post('/login/admin/login', adminController.adminLogin);

// Protected Admin Routes
router.get('/admin/detail/user/:id', verifyToken, verifyAdmin, adminController.getUserById);
router.put('/admin/update/user/:id', verifyToken, verifyAdmin, adminController.updateUserById);
router.delete('/admin/delete/:id', verifyToken, verifyAdmin, adminController.deleteUserById);

module.exports = router;
