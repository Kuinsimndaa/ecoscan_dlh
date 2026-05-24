// Centralized error handler for Express
module.exports = function errorHandler(err, req, res, next) {
  // Log internally (keep as error only)
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
  });
};
