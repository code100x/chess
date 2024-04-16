import { RedisClientType, createClient } from "redis";
import { DEFAULT_FEN, REDIS_URL } from "../config";
import { GameRole, WORKER_PROCESSES } from "@chess/common";
import { MessageType, WsMessageParser } from "../types/message";
import { Game } from "./game";
import { Worker } from "../worker/publish";

export class GameRoom {
    public static instance: GameRoom;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;
    private game?: Game;

    // userId: [gameid1, gameid2] -> incase for audience else only one gameid
    private subscriptions: Map<string, string[]>;
    // gameid: { user1: {userId: user1, ws: ws1, role: "black"}, user2: {userId: user2, ws: ws2, role: "white"}, audience: {userId: user3, ws: ws3, role: "audience"}}
    private reverseSubscriptions: Map<string, { [userId: string]: { userId: string, ws: WebSocket, role: GameRole } }>;

    constructor() {
        this.subscriber = createClient({
            url: REDIS_URL,
        });
        this.publisher = createClient({
            url: REDIS_URL,
        });
        this.subscriptions = new Map<string, string[]>();
        this.reverseSubscriptions = new Map<string, { [userId: string]: { userId: string, ws: any, role: GameRole } }>();

    }

    async connect() {
        await this.subscriber.connect();
        await this.publisher.connect();
    }

    // singleton
    static getInstance() {
        if (!this.instance) {
            this.instance = new GameRoom()
        }
        return this.instance;
    }

    //todo: give payload some type
    async getMatch(payload: any, ws: any) {
        const exceptGames = payload.exceptGame;
        let remainGames: string[] = [];
        this.reverseSubscriptions.forEach((value, key) => {
            if(!exceptGames.includes(key)) {
                remainGames.push(key);      
            }
        });
        const games = remainGames.filter((gameId) => {
            const room = this.reverseSubscriptions.get(gameId) || {};
            if(Object.keys(room).length >= 2) {
                return false;
            }
            if(Object.keys(room).length === 1) {
                return Object.values(room)[0]?.role !== payload.role;
            }
            return false;
        });

        if(games.length > 0) {
            return ws.send(JSON.stringify({
                type: MessageType.GetMatch,
                payload: {
                    type: MessageType.GetMatch,
                    payload: {
                        matchedGameId: games[Math.floor(Math.random() * games.length)]
                    }
                }
            }));
        }
        return ws.send(JSON.stringify({
            type: MessageType.GetMatch,
            payload: {
                type: MessageType.GetMatch,
                payload: {
                    matchedGameId: []
                }
            }
        }));
    }

    async subscribe(gameId: string, userId: string, role: GameRole, ws: any) {
        this.subscriptions.set(userId, [
            ...(this.subscriptions.get(userId) || []),
            gameId
        ]);


        if(Object.keys(this.reverseSubscriptions.get(gameId) || {}).length == 0) {
            this.reverseSubscriptions.set(gameId, {
                [userId]: { userId, ws, role }
            });
        }
        else if(Object.keys(this.reverseSubscriptions.get(gameId) || {}).length == 1) {
            let role = Object.values(this.reverseSubscriptions.get(gameId) || {})[0]?.role === GameRole.Black ? GameRole.White : GameRole.Black;
            this.reverseSubscriptions.set(gameId, {
                ...this.reverseSubscriptions.get(gameId),
                [userId]: { userId, ws, role }
            });
            //todo: check if the game has already started
            await Game.getInstance().pushFen(gameId, {
                lan: "",
                fen: DEFAULT_FEN,
            });

            //publish the game to worker;
            await Worker.getInstance().publishOne({
                type: WORKER_PROCESSES.DB_ADD_PLAYER,
                payload: {
                    gameId,
                    userId,
                    role
                }
            });
        }
        else {
            this.reverseSubscriptions.set(gameId, {
                ...this.reverseSubscriptions.get(gameId),
                [userId]: { userId, ws, role: GameRole.Audience }
            });
        }


        // to subscribe to the game if already a user is present as black or white
        if (Object.keys(this.reverseSubscriptions.get(gameId) || {}).length === 1) {
            console.log(`subscribe ${userId} to ${gameId} as ${role}`);

            //Todo: publish the state of the game to worker if role is black or white

            this.subscriber.subscribe(gameId, async (payload) => {
                const parsePayload = WsMessageParser.parse(JSON.parse(payload.toString()));

                if (parsePayload.type === MessageType.Move) {
                    const lastMove = await Game.getInstance().getLastMove(gameId);                    
                    try {
                        const subs = this.reverseSubscriptions.get(gameId) || {};
                        Object.values(subs).forEach(({ ws }) => {
                            ws.send(JSON.stringify({
                                type: MessageType.Move,
                                payload: {
                                    lastMove
                                }
                            }));
                        });

                    } catch (error) {
                        console.error(`Error sending message ${error}`);
                    }
                }
            });
        }
    }

    publish(gameId: string, data: {
        type: MessageType,
        payload: any
    }) {
        console.log(`publishing to ${gameId}`);
        this.publisher.publish(gameId, JSON.stringify(data));
    }
    
    async move(gameId: string, userId: string, payload: any) {

        
        // allow publishing only if the role is black or white
        if (this.reverseSubscriptions.get(gameId)?.[userId]) {
            if([GameRole.Black, GameRole.White].includes(this.reverseSubscriptions.get(gameId)?.[userId]?.role as GameRole)) {

                //todo: check for checkmate and stalemate, update the payload accordingly
                await Game.getInstance().move(gameId, userId, payload.from, payload.to);
                this.publish(
                    gameId, {
                    type: MessageType.Move,
                    payload: payload
                })
            } else {
                this.reverseSubscriptions.get(gameId)?.[userId]?.ws.send(JSON.stringify({
                    type: "error",
                    payload: "You are just an audience... you can't make a move."
                }))
            }
        }
    }


    unsubscribe(userId: string, gameId: string) {
        this.subscriptions.set(userId, [
            ...(this.subscriptions.get(userId) || []).filter((id) => id !== gameId)
        ]);
        if (this.subscriptions.get(userId)?.length === 0) {
            this.subscriptions.delete(userId)
        }

        delete this.reverseSubscriptions.get(gameId)?.[userId];
        if (
            !this.reverseSubscriptions.get(gameId) ||
            Object.keys(this.reverseSubscriptions.get(gameId) || {}).length === 0
        ) {
            //todo: save the game state to db by publishing to worker
            this.subscriber.unsubscribe(gameId);
            // removing the channel from the reverseSubscriptions
            this.reverseSubscriptions.delete(gameId);
        }
    }

}