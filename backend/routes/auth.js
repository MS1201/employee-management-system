const express = require('express');
const router  = express.Router();
const {
  register, login, getMe, logout,
  updateProfile, changePassword,
  getAllUsers, updateUserRole, toggleUserStatus
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.post('/logout',   protect, logout);
router.put('/profile',         protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users',           protect, authorize('super_admin'), getAllUsers);
router.put('/users/:id/role',  protect, authorize('super_admin'), updateUserRole);
router.put('/users/:id/toggle',protect, authorize('super_admin'), toggleUserStatus);

module.exports = router;

