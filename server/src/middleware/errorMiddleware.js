const errorHandler = (err, req, res, next) => {
  // Log the actual error for debugging
  console.error("Error details:", err);

  // Set status code - if err has statusCode, use it, otherwise 500
  let statusCode = 500;
  if (err && typeof err === 'object' && 'statusCode' in err) {
    statusCode = err.statusCode;
  }

  // Get message
  const message = (err && err.message) ? err.message : "Internal Server Error";

  // Send response
  res.status(statusCode).json({
    message: message
  });
};

module.exports = errorHandler;
