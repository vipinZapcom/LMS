const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// ✔ Register route first!
router.post('/login/:role/signup', register);

// ✔ Login route after
router.post('/login/:role', login);

module.exports = router;
