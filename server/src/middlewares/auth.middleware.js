import { verifyAccessToken } from '../utils/token.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/index.js';
import { userRepository } from '../repositories/user.repository.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required: missing Bearer token'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication token not found'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access token expired, please refresh token'));
      }
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid access token'));
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'User no longer exists'));
    }

    if (!user.isActive) {
      return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been deactivated'));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, error.message || 'Authentication error'));
  }
};
