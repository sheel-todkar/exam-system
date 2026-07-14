// Central error handler middleware (scaffold)

function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
}

module.exports = { errorHandler };

function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate record' });
  }

  return res.status(500).json({ message: 'Internal Server Error' });
}

module.exports = errorHandler;
