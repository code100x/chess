import { Request, Response, Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
const router = Router();

const CLIENT_URL =
  process.env.AUTH_REDIRECT_URL ?? 'http://localhost:5173/game/random';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface User {
  id: string;
  token?: string;
  name: string;
  isGuest?: boolean;
}

// this route is to be hit when the user wants to login as a guest
router.post('/guest', async (req: Request, res: Response) => {
  const bodyData = req.body;
  let guestUUID = 'guest-' + uuidv4();

  const user = await db.user.create({
    data: {
      username: guestUUID,
      email: guestUUID + '@chess100x.com',
      name: bodyData.name || guestUUID,
      provider: 'GUEST',
    },
  });

  const token = jwt.sign(
    { userId: user.id, name: user.name, isGuest: true },
    JWT_SECRET,
  );
  let User: User = {
    id: user.id,
    name: user.name!,
    token: token,
    isGuest: true,
  };
  res.json(User);
});

router.get('/refresh', async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;

    // Token is issued so it can be shared b/w HTTP and ws server
    // Todo: Make this temporary and add refresh logic here

    const userDb = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    const token = jwt.sign({ userId: user.id, name: userDb?.name }, JWT_SECRET);
    res.json({
      token,
      id: user.id,
      name: userDb?.name,
    });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

router.get('/login/failed', (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: 'failure' });
});

router.get('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).json({ error: 'Failed to log out' });
    } else {
      res.clearCookie('jwt');
      res.redirect('http://localhost:5173/');
    }
  });
});

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
  passport.authenticate('github', { scope: ['profile', 'email'] }),
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
