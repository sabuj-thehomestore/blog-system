import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  restorePost,
  hardDeletePost,
  getMyPosts
} from '../controllers/post.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { logActivity } from '../middlewares/activityLogger.middleware.js';
import { createPostSchema, updatePostSchema, queryPostSchema } from '../validations/post.validation.js';
import { ACTIVITY_ACTIONS, ROLES } from '../constants/index.js';

const router = Router();

// Public routes
router.get('/', validate(queryPostSchema, 'query'), getPosts);
router.get('/slug/:slug', getPostBySlug);

// Authenticated user routes
router.post(
  '/',
  verifyJWT,
  validate(createPostSchema),
  logActivity(ACTIVITY_ACTIONS.POST_CREATE, 'POST', (req, res) => res.locals?.postId),
  createPost
);

router.get('/user/my-posts', verifyJWT, getMyPosts);

router.put(
  '/:id',
  verifyJWT,
  validate(updatePostSchema),
  logActivity(ACTIVITY_ACTIONS.POST_UPDATE, 'POST'),
  updatePost
);

router.delete(
  '/:id',
  verifyJWT,
  logActivity(ACTIVITY_ACTIONS.POST_DELETE, 'POST'),
  deletePost
);

// Admin-only operations on posts
router.patch(
  '/:id/restore',
  verifyJWT,
  requireRole(ROLES.ADMIN),
  logActivity(ACTIVITY_ACTIONS.POST_RESTORE, 'POST'),
  restorePost
);

router.delete(
  '/:id/permanent',
  verifyJWT,
  requireRole(ROLES.ADMIN),
  logActivity(ACTIVITY_ACTIONS.POST_HARD_DELETE, 'POST'),
  hardDeletePost
);

export default router;
