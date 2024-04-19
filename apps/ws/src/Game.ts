import { WebSocket } from "ws";
import { Chess } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { db } from "./db";
import { randomUUID } from "crypto";

export class Game {
    public gameId: string;
    public player1: { id: string; socket: WebSocket };
    public player2: { id: string; socket: WebSocket };
    public board: Chess
    private startTime: Date;
    private moveCount = 0;

    constructor(player1: { id: string; socket: WebSocket }, player2: { id: string; socket: WebSocket }) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.startTime = new Date();
        this.gameId = randomUUID();
    }

    async createGameHandler() {
        try {
            await this.createGameInDb(); 
        } catch(e) {
            console.error(e)
            return;
        }

        const users = await db.user.findMany({
            where: {
                id: {
                    in: [this.player1.id, this.player2.id]
                }
            }
        });

        if (this.player1)
            this.player1.socket.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "white",
                    gameId: this.gameId,
                    whitePlayer: users.find(user => user.id === this.player1.id)?.name,
                    blackPlayer: users.find(user => user.id === this.player1.id)?.name,
                    fen: this.board.fen()
                }
            }));
        if (this.player2)
            this.player2.socket.send(JSON.stringify({
                type: INIT_GAME,
                payload: {
                    color: "black",
                    gameId: this.gameId,
                    whitePlayer: users.find(user => user.id === this.player1.id)?.name,
                    blackPlayer: users.find(user => user.id === this.player1.id)?.name,
                    fen: this.board.fen()
                }
            }));
    }

    async createGameInDb() {
        const game = await db.game.create({
            data: {
                id: this.gameId,
                timeControl: "CLASSICAL",
                status: "IN_PROGRESS",
                currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
                whitePlayer: {
                    connect: {
                        id: this.player1.id
                    }
                },
                blackPlayer: {
                    connect: {
                        id: this.player2.id
                    }
                },
            },
            include: {
                whitePlayer: true,
                blackPlayer: true,
            }
        })
        this.gameId = game.id;
    }
    async addMoveToDb(move: {
        from: string;
        to: string;
    }) {
        await db.$transaction([
            db.move.create({
                data: {
                    gameId: this.gameId,
                    moveNumber: this.moveCount + 1,
                    from: move.from,
                    to: move.to,
                    // Todo: Fix start fen
                    startFen: this.board.fen(),
                    endFen: this.board.fen(),
                    createdAt: new Date(Date.now()),
                },
            }), 
            db.game.update({
                data: {
                    currentFen: this.board.fen()
                },
                where: {
                    id: this.gameId
                }
            })
        ])
    }

    async makeMove(socket: WebSocket, move: {
        from: string;
        to: string;
    }) {
        // validate the type of move using zod
        if (this.moveCount % 2 === 0 && socket !== this.player1.socket) {
            return
        }
        if (this.moveCount % 2 === 1 && socket !== this.player2.socket) {

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
            if (this.player1) {
                this.player1.socket.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }))
            }

            if (this.player2) {
                this.player2.socket.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        winner: this.board.turn() === "w" ? "black" : "white"
                    }
                }))
            }
            return;
        }

        if (this.moveCount % 2 === 0) {
            if (this.player2)
                this.player2.socket.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }))
        } else {
            if (this.player1)
                this.player1.socket.send(JSON.stringify({
                    type: MOVE,
                    payload: move
                }))
        }
        this.moveCount++;
    }
}
