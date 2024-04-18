import { WebSocket } from "ws";
import { Chess } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import db from "./db"
export class Game {
    public gameId: string | null = null
    public player1: WebSocket | null;
    public player2: WebSocket | null;
    public board: Chess
    private startTime: Date;
    private moveCount = 0;
    private failedDbMoves: { moveNumber: number, from: string, to: string, playedAt: Date }[] = []

    constructor(player1: WebSocket, player2: WebSocket | null) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
    }

    async createGameHandler() {
        await this.createGameInDb();
        if (this.player1)
            this.player1.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "white",
                    gameId: this.gameId
                }
            }));
        if (this.player2)
            this.player2.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "black",
                    gameId: this.gameId
                }
            }));
    }

    async createGameInDb() {
        try {
            const game = await db.game.create({
                // TODO: Add user detials when auth is complete
                data: {
                    playerWhite: {
                        create: {},
                    },
                    playerBlack: {
                        create: {},
                    },
                },
                include: {
                    playerWhite: true,
                    playerBlack: true,
                }
            })
            this.gameId = game.id;
        } catch (err) {
            console.error('Error creating game in database:', err);
        }
    }
    async addMoveToDb(move: {
        from: string;
        to: string;
    }) {
        if (this.gameId)
            try {
                await db.move.create({
                    // TODO: Add user detials when auth is complete
                    data: {
                        gameId: this.gameId,
                        moveNumber: this.moveCount + 1,
                        from: move.from,
                        to: move.to,
                        playedAt: new Date(Date.now())
                    },

                })
            } catch (err) {
                this.failedDbMoves.push({
                    moveNumber: this.moveCount + 1,
                    from: move.from,
                    to: move.to,
                    playedAt: new Date(Date.now())
                })
            }
    }


    async makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }) {
        // validate the type of move using zod
        if (this.moveCount % 2 === 0 && socket !== this.player1) {

            return
        }
        if (this.moveCount % 2 === 1 && socket !== this.player2) {

            return;
        }
        try {
            this.board.move(move);
        } catch (e) {
            console.log(e);
            return;
        }

        await this.addMoveToDb(move);

        if (this.board.isGameOver()) {
            // Send the game over message to both players
            if (this.player1)
                this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }))
            if (this.player2)
                this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }))
            if (this.failedDbMoves.length > 0 && this.gameId) {
                try {
                    await db.move.createMany({
                        data: this.failedDbMoves.map((move) => ({ gameId: this.gameId!, ...move }))
                    })
                } catch (err) {
                    console.error("Couldn't add games to the database", err)
                }
            }
            return;
        }

        if (this.moveCount % 2 === 0) {
            if (this.player2)
                this.player2.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }))
        } else {
            if (this.player1)
                this.player1.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }))
        }
        this.moveCount++;
    }
}
