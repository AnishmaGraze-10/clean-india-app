const express = require("express");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Middleware
app.use(express.json());

// Health Route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use(errorHandler);

module.exports = app;
