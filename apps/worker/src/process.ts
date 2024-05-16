import { db } from './db';

export const addMove = async (
    from: string,
    to: string,
    gameId: string,
    startFen: string,
    endFen: string,
    moveNumber: number,
    createdAt: Date,
    timeTaken: number | null
) => {
    try {
        await db.$transaction([
            db.move.create({
              data: {
                gameId,
                moveNumber,
                from,
                to,
                startFen,
                endFen,
                createdAt,
                timeTaken,
              },
            }),
            db.game.update({
              data: {
                currentFen: endFen,
              },
              where: {
                id: gameId,
              },
            }),
          ]);
    } catch (error) {
        //todo: acknowledge the error and repush the message to the queue
        console.log(error);
        return;
    }
}