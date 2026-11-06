import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getAllPosts,
  getActivityLogs
} from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { logActivity } from '../middlewares/activityLogger.middleware.js';
import { updateRoleSchema, updateStatusSchema } from '../validations/auth.validation.js';
import { ROLES, ACTIVITY_ACTIONS } from '../constants/index.js';

const router = Router();

// Apply auth and admin check to all routes in this router
router.use(verifyJWT, requireRole(ROLES.ADMIN));

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);

router.patch(
  '/users/:id/role',
  validate(updateRoleSchema),
  logActivity(ACTIVITY_ACTIONS.USER_ROLE_CHANGE, 'USER'),
  updateUserRole
);

router.patch(
  '/users/:id/status',
  validate(updateStatusSchema),
  logActivity(ACTIVITY_ACTIONS.USER_STATUS_CHANGE, 'USER'),
  updateUserStatus
);

router.get('/posts', getAllPosts);

router.get('/logs', getActivityLogs);

export default router;
