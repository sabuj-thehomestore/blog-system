import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        'Too many authentication attempts from this IP, please try again after 15 minutes'
      )
    );
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(
      new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        'Too many requests from this IP, please slow down'
      )
    );
  }
});
