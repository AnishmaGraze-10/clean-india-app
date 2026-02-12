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

module.exports = { registerUser, loginUser, registerAdmin };
