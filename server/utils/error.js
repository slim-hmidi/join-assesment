class ErrorHandler extends Error {
  constructor(status, message) {
    super(message);
    this.statusCode = status;
  }
}


const errorMiddleware = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const { message } = error;

  res.send(statusCode).send({
    message,
  });
  return next();
};

module.exports = {
  ErrorHandler,
  errorMiddleware,
};
