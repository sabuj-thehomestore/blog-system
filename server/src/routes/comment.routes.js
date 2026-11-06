import { Router } from 'express';
import {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment
} from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { logActivity } from '../middlewares/activityLogger.middleware.js';
import {
  createCommentSchema,
  updateCommentSchema,
  queryCommentSchema
} from '../validations/comment.validation.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';

const router = Router();

// Public: View comments on a post
router.get(
  '/post/:postId',
  validate(queryCommentSchema, 'query'),
  getCommentsByPost
);

// Authenticated users: Create comment
router.post(
  '/post/:postId',
  verifyJWT,
  validate(createCommentSchema),
  logActivity(ACTIVITY_ACTIONS.COMMENT_CREATE, 'COMMENT'),
  createComment
);

// Authenticated users: Edit comment (only comment owner)
router.put(
  '/:id',
  verifyJWT,
  validate(updateCommentSchema),
  logActivity(ACTIVITY_ACTIONS.COMMENT_UPDATE, 'COMMENT'),
  updateComment
);

// Authenticated users: Delete comment (owner or Admin)
router.delete(
  '/:id',
  verifyJWT,
  logActivity(ACTIVITY_ACTIONS.COMMENT_DELETE, 'COMMENT'),
  deleteComment
);

export default router;
