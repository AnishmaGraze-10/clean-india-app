const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware - Verify JWT token and attach user to req
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      const err = new Error('Not authorized, no token');
      err.statusCode = 401;
      return next(err);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by decoded ID
      const user = await User.findById(decoded.id);

      if (!user) {
        const err = new Error('Not authorized, user not found');
        err.statusCode = 401;
        return next(err);
      }

      // Attach user to request object
      req.user = user;
      return next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      const error = new Error('Not authorized, invalid token');
      error.statusCode = 401;
      return next(error);
    }
  } catch (err) {
    console.error('Protect middleware error:', err);
    const error = new Error('Not authorized');
    error.statusCode = 401;
    return next(error);
  }
};

/**
 * Authorize Roles middleware - Check if user has required role
 * Usage: authorizeRoles('admin') or authorizeRoles('user', 'admin')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      const err = new Error('Not authorized');
      err.statusCode = 401;
      return next(err);
    }

    // Check if user role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      const err = new Error('Forbidden: Access denied');
      err.statusCode = 403;
      return next(err);
    }

    return next();
  };
};

module.exports = { protect, authorizeRoles };
