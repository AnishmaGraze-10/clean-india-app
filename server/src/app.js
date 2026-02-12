const express = require("express");
const errorHandler = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(express.json());

// Health Route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Protected User Routes
app.use("/api/user", userRoutes);

// Protected Admin Routes
app.use("/api/admin", adminRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
