const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

/**
 * GET /api/user/profile
 * Get logged-in user's profile
 * Protected route - requires valid JWT token
 */
router.get('/profile', protect, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        points: req.user.points
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile'
    });
  }
});

module.exports = router;
