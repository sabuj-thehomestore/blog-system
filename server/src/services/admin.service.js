import { userRepository } from '../repositories/user.repository.js';
import { postRepository } from '../repositories/post.repository.js';
import { commentRepository } from '../repositories/comment.repository.js';
import { activityLogRepository } from '../repositories/activityLog.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { HTTP_STATUS, ROLES } from '../constants/index.js';

export class AdminService {
  async getDashboardStats() {
    const [
      totalUsers,
      totalPosts,
      activePosts,
      deletedPosts,
      totalComments
    ] = await Promise.all([
      userRepository.count(),
      postRepository.countTotal(),
      postRepository.countActive(),
      postRepository.count({ isDeleted: true }),
      commentRepository.countActive()
    ]);

    return {
      totalUsers,
      totalPosts,
      activePosts,
      deletedPosts,
      totalComments
    };
  }

  async getAllUsers({ page = 1, limit = 10, search = '', role = '' }) {
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    return userRepository.findPaginated({
      filter,
      page,
      limit,
      sort: { createdAt: -1 },
      select: '-password -refreshToken'
    });
  }

  async updateUserRole(userId, newRole, currentAdminId) {
    if (userId.toString() === currentAdminId.toString() && newRole !== ROLES.ADMIN) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot remove the admin role from yourself');
    }

    const updatedUser = await userRepository.updateUserRole(userId, newRole);
    if (!updatedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return updatedUser;
  }

  async updateUserStatus(userId, isActive, currentAdminId) {
    if (userId.toString() === currentAdminId.toString() && !isActive) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'You cannot deactivate your own admin account');
    }

    const updatedUser = await userRepository.updateUserStatus(userId, isActive);
    if (!updatedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    return updatedUser;
  }

  async getAllPosts({ page = 1, limit = 10, isDeleted = null, search = '' }) {
    return postRepository.findAllPostsAdmin({ page, limit, isDeleted, search });
  }

  async getActivityLogs({ page = 1, limit = 20, action = null, userId = null }) {
    return activityLogRepository.getRecentLogs({ page, limit, action, userId });
  }
}

export const adminService = new AdminService();
