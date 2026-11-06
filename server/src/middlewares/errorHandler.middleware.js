import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

// Catch 404 and forward to error handler
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route not found: ${req.originalUrl}`));
};

// Centralized error handler
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new ApiError(HTTP_STATUS.BAD_REQUEST, message);
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    error = new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, 'Database validation error', errors);
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication token expired');
  }

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  });
};
