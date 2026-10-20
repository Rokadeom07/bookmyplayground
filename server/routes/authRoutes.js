const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  registerOwner,
  login,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register-customer', registerCustomer);
router.post('/register-owner', registerOwner);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
