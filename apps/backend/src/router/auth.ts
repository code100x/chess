import { Request, Response, Router } from 'express';
import passport from 'passport';
import { asyncHandler } from '../utils/handlers';
import {
  deleteAccount,
  fail,
  getToken,
  getUserInfo,
  logout,
  updateUserInfo,
} from '../controllers/auth';

const router = Router();

const CLIENT_URL =
  process.env.AUTH_REDIRECT_URL ?? 'http://localhost:5173/game/random';

router.get('/refresh', asyncHandler(getToken));
router.get('/userInfo', asyncHandler(getUserInfo));
router.get('/login/failed', asyncHandler(fail));
router.get('/logout', asyncHandler(logout));
router.post('/updateUser', asyncHandler(updateUserInfo));
router.delete('/deleteAccount', asyncHandler(deleteAccount));

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  }),
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['read:user', 'user:email'] }),
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  }),
);

router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['profile'] }),
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: CLIENT_URL,
    failureRedirect: '/login/failed',
  }),
);

export default router;
