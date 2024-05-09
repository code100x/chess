import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { AppError } from '../utils/error';

interface User {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const getToken = async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;

    // Token is issued so it can be shared b/w HTTP and ws server
    // Todo: Make this temporary and add refresh logic here

    const userDb = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    return res.json({
      token,
      id: user.id,
      name: userDb?.name,
    });
  } else {
    throw new AppError({ name: 'UNAUTHORIZED', message: 'Unauthorized!' });
  }
};

export const getUserInfo = async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;
    const userDb = await db.user.findFirst({
      where: {
        id: user.id,
      },
      include: {
        gamesAsBlack: {
          include: {
            whitePlayer: true,
            blackPlayer: true,
          },
        },
        gamesAsWhite: {
          include: {
            whitePlayer: true,
            blackPlayer: true,
          },
        },
      },
    });

    return res.status(200).json({
      email: userDb?.email,
      rating: userDb?.rating,
      username: userDb?.username,
      name: userDb?.name,
      gamesAsBlack: userDb?.gamesAsBlack,
      gamesAsWhite: userDb?.gamesAsWhite,
    });
  } else {
    throw new AppError({ name: 'UNAUTHORIZED', message: 'Unauthorized!' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;
    const deletedUser = await db.user.delete({
      where: {
        id: user.id,
      },
    });

    if (deletedUser) {
      return res.status(200).json({ success: true });
    }
    throw new AppError({
      name: 'INTERNAL_SERVER_ERROR',
      message: 'Some error occurred!',
    });
  }
};

export const updateUserInfo = async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;
    const { username } = req.body;
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        username: username,
      },
    });

    if (updatedUser) {
      return res.status(200).json({ success: true });
    }

    throw new AppError({
      name: 'INTERNAL_SERVER_ERROR',
      message: 'Some error occurred!',
    });
  } else {
    throw new AppError({ name: 'UNAUTHORIZED', message: 'Unauthorized!' });
  }
};

export const logout = async (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).json({ error: 'Failed to log out' });
    } else {
      res.clearCookie('jwt');
      res.redirect('http://localhost:5173/');
    }
  });
};

export const fail = async (req: Request, res: Response) => {
  throw new AppError({ name: 'UNAUTHORIZED', message: 'Failed!' });
};
