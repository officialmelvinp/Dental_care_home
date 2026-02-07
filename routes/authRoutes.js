const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const {
    registerUser,
    authUser,
    getMe,
    getAllUsers,
    deleteUser,
    updateMe,
    updateUserRole,
    logoutUser,
    refreshAccessToken,
    verifyEmail,
    resendVerification,
} = require('../controllers/authController');

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/refresh-token', refreshAccessToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);


// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Admin routes
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
