import { Router } from 'express';
import { db } from '../db';

const v1Router = Router();

export const IN_PROGRESS = 'IN_PROGRESS';

v1Router.get('/', (req, res) => {
  res.send('Hello, World!');
});

v1Router.get('/games', async (req, res) => {
  try {
    const games = await db.game.findMany({
      include: {
        blackPlayer: true,
        whitePlayer: true,
      },
      where: {
        status: IN_PROGRESS,
      },
    });
    res.json(games);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default v1Router;
