class ErrorHandler extends Error {
  constructor(status, message) {
    super(message);
    this.statusCode = status;
  }
}


const errorMiddleware = (error, req, res, next) => {
  const { statusCode } = error;
  const status = statusCode || 500;
  const message = status === 500 ? 'INTERNAL SERVER ERROR' : error.message;

  res.status(status).json({
    message,
  });
  return next();
};

module.exports = {
  ErrorHandler,
  errorMiddleware,
};
