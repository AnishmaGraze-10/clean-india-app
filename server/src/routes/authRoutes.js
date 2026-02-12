const express = require("express");
const { registerUser, loginUser, registerAdmin, createInvite, registerWithInvite } = require("../controllers/authController");
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register-admin", registerAdmin);
// Invite creation (admin-only)
router.post('/invite', protect, authorizeRoles('admin'), createInvite);

// Register with invite token (public)
router.post('/register-with-invite', registerWithInvite);

module.exports = router;
