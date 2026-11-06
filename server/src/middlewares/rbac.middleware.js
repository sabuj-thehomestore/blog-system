import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, ROLES } from '../constants/index.js';

/**
 * Middleware to restrict endpoints to specific role(s).
 * @param  {...string} allowedRoles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required before role check'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access denied: requires one of the following roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

/**
 * Middleware helper to check if the current user is an Admin or is the owner of a resource.
 * Receives an async resolver function `getResource(req)` that returns `{ author: ObjectId | string }`.
 */
export const requireOwnerOrAdmin = (getResource) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
      }

      // Admins bypass resource ownership restriction
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      const resource = await getResource(req);
      if (!resource) {
        return next(new ApiError(HTTP_STATUS.NOT_FOUND, 'Resource not found'));
      }

      const resourceAuthorId = (resource.author?._id || resource.author)?.toString();
      if (resourceAuthorId !== req.user.id) {
        return next(
          new ApiError(
            HTTP_STATUS.FORBIDDEN,
            'Permission denied: you can only modify or delete your own resources'
          )
        );
      }

      // Attach resolved resource to request to prevent double querying
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};
