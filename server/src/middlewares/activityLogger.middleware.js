import { activityLogRepository } from '../repositories/activityLog.repository.js';

/**
 * Middleware factory to log user activity upon successful response completion.
 * @param {string} action - ACTIVITY_ACTIONS constant
 * @param {string} resourceType - 'USER' | 'POST' | 'COMMENT' | 'AUTH'
 * @param {Function} [getResourceId] - Optional extractor fn: (req, res) => ObjectId | string
 */
export const logActivity = (action, resourceType, getResourceId = null) => {
  return (req, res, next) => {
    // Intercept finish event to ensure we only log on successful requests (2xx or 3xx)
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        const userId = req.user ? req.user.id : null;
        let resourceId = null;

        if (getResourceId) {
          try {
            resourceId = getResourceId(req, res);
          } catch (err) {
            // non-blocking
          }
        } else if (req.params?.id) {
          resourceId = req.params.id;
        }

        const ipAddress = req.ip || req.connection?.remoteAddress || '';
        const userAgent = req.get('User-Agent') || '';

        activityLogRepository
          .logActivity({
            user: userId,
            action,
            resourceType,
            resourceId,
            ipAddress,
            userAgent,
            details: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode
            }
          })
          .catch((err) => {
            console.error('[ActivityLogger] Error creating log:', err.message);
          });
      }
    });

    next();
  };
};
