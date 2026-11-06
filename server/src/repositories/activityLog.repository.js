import { BaseRepository } from './base.repository.js';
import { ActivityLog } from '../models/ActivityLog.js';

export class ActivityLogRepository extends BaseRepository {
  constructor() {
    super(ActivityLog);
  }

  async logActivity({ user = null, action, resourceType, resourceId = null, ipAddress = '', userAgent = '', details = {} }) {
    try {
      return await this.model.create({
        user,
        action,
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        details
      });
    } catch (err) {
      console.error('[ActivityLogRepository] Failed to log activity:', err.message);
      return null;
    }
  }

  async getRecentLogs({ page = 1, limit = 20, action = null, userId = null } = {}) {
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.user = userId;

    return this.findPaginated({
      filter,
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [{ path: 'user', select: 'name email role' }]
    });
  }
}

export const activityLogRepository = new ActivityLogRepository();
