const AppError = require('../utils/appError');

const handelCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};

const errorDublicateFieldDB = (err) => {
  const message = `Dublicate field value ${err.keyValue.name}:Please use another value.`;
  return new AppError(message, 400);
};

const errorValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data. ${errors.join('. ')}`;
  return new AppError(err.message, 400);
};

const handleJWTerror = () => new AppError('Invalid token.Please login again ', 401);

const handleJWTExpirederror = () => new AppError('Your token has expired.Please login again', 401);

const sendErrordev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorpro = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong.',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrordev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handelCastErrorDB(error);
    if (error.code === 11000) error = errorDublicateFieldDB(error);
    if (error.name === 'ValidationError') error = errorValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTerror();
    if (error.name === 'TokenExpiredError') error = handleJWTExpirederror();
    sendErrorpro(error, res);
  }
};
