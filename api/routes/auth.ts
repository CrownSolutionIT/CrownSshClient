import { Router } from 'express';
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

const router = Router();

// Google Auth Trigger
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err: any, user: any, info: any) => {
    if (err) {
      logger.error('Passport auth error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || ''}/login?error=${encodeURIComponent(err.message || 'Authentication failed')}`);
    }
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL || ''}/login?error=${encodeURIComponent(info?.message || 'User not found')}`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        logger.error('Passport login error:', loginErr);
        return res.redirect(`${process.env.FRONTEND_URL || ''}/login?error=${encodeURIComponent(loginErr.message || 'Login failed')}`);
      }

      // Explicitly save session before redirecting to avoid race conditions with MongoDB store
      req.session.save((saveErr) => {
        if (saveErr) {
          logger.error('Session save error:', saveErr);
        }
        // Use absolute redirect to FRONTEND_URL to ensure we stay on the correct port (7001)
        res.redirect(`${process.env.FRONTEND_URL || '/'}`);
      });
    });
  })(req, res, next);
});

// Get current user
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
}));

// Logout
router.post('/logout', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ success: true });
  });
}));

export default router;
