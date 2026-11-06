import { adminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS } from '../constants/index.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, stats, 'Admin stats retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role } = req.query;
    const result = await adminService.getAllUsers({ page, limit, search, role });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.items,
        'Users list retrieved successfully',
        {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages
        }
      )
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const updatedUser = await adminService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user.id
    );

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, updatedUser, 'User role updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const updatedUser = await adminService.updateUserStatus(
      req.params.id,
      req.body.isActive,
      req.user.id
    );

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, updatedUser, 'User status updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const { page, limit, isDeleted, search } = req.query;
    const result = await adminService.getAllPosts({ page, limit, isDeleted, search });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.items,
        'All posts retrieved successfully',
        {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages
        }
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req, res, next) => {
  try {
    const { page, limit, action, userId } = req.query;
    const result = await adminService.getActivityLogs({ page, limit, action, userId });

    res.status(HTTP_STATUS.OK).json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.items,
        'Activity logs retrieved successfully',
        {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages
        }
      )
    );
  } catch (error) {
    next(error);
  }
};
