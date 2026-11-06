import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  handleOAuthSuccess
} from '../controllers/auth.controller.js';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { logActivity } from '../middlewares/activityLogger.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations/auth.validation.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';

const router = Router();

// Registration & Login protected by rate limiter and validation
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  logActivity(ACTIVITY_ACTIONS.REGISTER, 'AUTH'),
  register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  logActivity(ACTIVITY_ACTIONS.LOGIN, 'AUTH'),
  login
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  refreshToken
);

router.post(
  '/logout',
  verifyJWT,
  logActivity(ACTIVITY_ACTIONS.LOGOUT, 'AUTH'),
  logout
);

router.get(
  '/me',
  verifyJWT,
  getMe
);

// OAuth - Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
  logActivity(ACTIVITY_ACTIONS.LOGIN, 'AUTH'),
  handleOAuthSuccess
);

// OAuth - Facebook
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'], session: false })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=oauth_failed' }),
  logActivity(ACTIVITY_ACTIONS.LOGIN, 'AUTH'),
  handleOAuthSuccess
);

export default router;
