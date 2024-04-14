import { Chess, Move, Square } from 'chess.js';
import { RedisClientType, createClient } from 'redis';
import { REDIS_URL } from '../config';

// class to handle game logic
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
        return this.chess.history({verbose: true});
    }

    async getLegalMoves(gameId: string, pos: string): Promise<Move[]> {
        await this.loadGame(gameId);
        return this.chess.moves({square: pos as Square, verbose: true});
    }

    async getLastMove(gameId: string) {
        const list = await this.redis.lRange(gameId, 0, 0);
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
        if(!fen) {
            return;
        }
        this.chess.load(fen);
    }

    async move(gameId: string, userId: string, from: string, to: string) {
        await this.loadGame(gameId);
        const move = this.chess.move({from: from as Square, to: to as Square});
        console.log(this.chess.ascii());
        if(move) {
            await this.pushFen(gameId, {
                lan: move.lan,
                fen: this.chess.fen()
            });
            return;
        }
    }
}