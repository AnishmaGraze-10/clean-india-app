const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * GET /api/admin/dashboard
 * Admin-only dashboard access
 * Protected route - requires valid JWT token AND admin role
 */
router.get('/dashboard', protect, authorizeRoles('admin'), (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Welcome Admin',
      data: {
        adminName: req.user.name,
        adminEmail: req.user.email,
        role: req.user.role,
        dashboardAccess: true
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error accessing admin dashboard'
    });
  }
});

module.exports = router;
