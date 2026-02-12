const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const err = new Error('Please provide all required fields');
      err.statusCode = 400;
      return next(err);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const err = new Error('User already exists');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    return next(error);
  }
};

// Login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Debug logging
    console.log("LOGIN ATTEMPT - EMAIL:", email);
    console.log("LOGIN ATTEMPT - PASSWORD:", password ? '***' : undefined);

    if (!email || !password) {
      const err = new Error('Please provide email and password');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findOne({ email });

    console.log("USER FOUND:", user ? "Yes" : "No");

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      return next(err);
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return next(error);
  }
};

// Register Admin (requires ADMIN_KEY header 'x-admin-key')
const registerAdmin = async (req, res, next) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      const err = new Error('Not authorized to create admin');
      err.statusCode = 403;
      return next(err);
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      const err = new Error('Please provide all required fields');
      err.statusCode = 400;
      return next(err);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const err = new Error('User already exists');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.create({ name, email, password, role: 'admin' });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    return next(error);
  }
};

// Create an invite token for admin onboarding (admin-only)
const crypto = require('crypto');
const Invite = require('../models/Invite');

const createInvite = async (req, res, next) => {
  try {
    // Only admins should be able to create invites — route will be protected with authorizeRoles
    const { email } = req.body;
    if (!email) {
      const err = new Error('Please provide email to invite');
      err.statusCode = 400;
      return next(err);
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const invite = await Invite.create({ email, token, createdBy: req.user._id, expiresAt });

    // For now return the token in response so it can be used for manual testing.
    res.status(201).json({ inviteId: invite._id, token: invite.token, expiresAt: invite.expiresAt });
  } catch (error) {
    return next(error);
  }
};

// Register using invite token (creates admin)
const registerWithInvite = async (req, res, next) => {
  try {
    const { token, name, email, password } = req.body;
    if (!token || !name || !email || !password) {
      const err = new Error('Please provide token, name, email and password');
      err.statusCode = 400;
      return next(err);
    }

    const invite = await Invite.findOne({ token });
    if (!invite) {
      const err = new Error('Invalid invite token');
      err.statusCode = 400;
      return next(err);
    }

    if (invite.used) {
      const err = new Error('Invite already used');
      err.statusCode = 400;
      return next(err);
    }

    if (invite.expiresAt < new Date()) {
      const err = new Error('Invite expired');
      err.statusCode = 400;
      return next(err);
    }

    if (invite.email !== email) {
      const err = new Error('Invite email does not match');
      err.statusCode = 400;
      return next(err);
    }

    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('User already exists');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.create({ name, email, password, role: 'admin' });

    invite.used = true;
    invite.usedBy = user._id;
    await invite.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { registerUser, loginUser, registerAdmin, createInvite, registerWithInvite };
