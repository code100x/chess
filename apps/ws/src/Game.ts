import { Chess, Move, Square } from 'chess.js'
import db from "./db"
import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "./config";
import { GameRole } from "./types/enums";
import { MessageType } from "./types/valid";

export class Game {
    private chess: Chess;
    public static instance: Game;
    private redis: RedisClientType;

    constructor() {
        this.redis = createClient({
            url: REDIS_URL,
        });

        this.chess = new Chess();
    }

    async connect() {
        await this.redis.connect();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Game()
        }
        return this.instance;
    }

    async getHistory(gameId: string) {
        await this.loadGame(gameId);
        return this.chess.history({ verbose: true });
    }

    async getLegalMoves(gameId: string, pos: string): Promise<Move[]> {
        await this.loadGame(gameId);
        return this.chess.moves({ square: pos as Square, verbose: true });
    }

    async getLastMove(gameId: string) {
        const list = await this.redis.lRange(gameId, 0, 0);
        
        //check for critcal events like stalemate, checkmate, draw
        await this.loadGame(gameId);
        if(this.chess.isGameOver()) {
            return {
                ...JSON.parse(list[0] || ""),
                gameOver: true,
                winner: this.chess.turn() === "w" ? "black" : "white"
            };
        }
        return JSON.parse(list[0] || "");
    }

    async pushFen(gameId: string, obj: Move | {
        lan: string;
        fen: string;
    }) {
        return this.redis.lPush(gameId, JSON.stringify(obj));
    }

    async getFen(gameId: string) {
        const list = await this.redis.lRange(gameId, 0, 0);
        return JSON.parse(list[0] || "")?.fen;
    }

    async loadGame(gameId: string) {
        let fen = await this.getFen(gameId);
        if (!fen) {
            return;
        }
        this.chess.load(fen);
    }

    async move(gameId: string, userId: string, role: GameRole, from: string, to: string, ws: any) {
        await this.loadGame(gameId);

        if ((role === GameRole.BLACK && this.chess.turn() === "w") ||
            (role === GameRole.WHITE && this.chess.turn() === "b")) {
            return ws.send(JSON.stringify({
                type: MessageType.ERROR,
                payload: {
                    message: "It's not your turn",
                    userId,
                    gameId
                }
            }));
        }
        const move = this.chess.move({ from: from as Square, to: to as Square });
        console.log(this.chess.ascii());

        if (move) {
            await this.pushFen(gameId, {
                lan: move.lan,
                fen: this.chess.fen()
            });

            // await this.addMoveToDb({
            //     from,
            //     to,
            //     gameId,
            //     fen: this.chess.fen()
            // });
            return;
        }
    }

    async addMoveToDb(move: {
        from: string;
        to: string;
        gameId: string;
        fen: string;
    }) {
        await db.$transaction([
            db.move.create({
                data: {
                    gameId: move.gameId,
                    startFen: move.from,
                    endFen: move.to,
                    createdAt: new Date(Date.now()),
                    notation: move.fen
                },
            }),
            db.game.update({
                data: {
                    currentFen: move.fen
                },
                where: {
                    id: move.gameId
                }
            })
        ])
    }
}