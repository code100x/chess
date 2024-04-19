import { RedisClientType, createClient } from "redis";
import db from "./db";
import { GameRole, GameStatus } from "./types/enums";
import { Game } from "./Game";
import { DEFAULT_FEN, REDIS_URL } from "./config";
import { MessageType, WsMessageParser } from "@chess-monorepo/common";

export class GameManager {
    public static instance: GameManager;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;

    private users: Map<string, string[]>;
    private games: Map<string, { [userId: string]: { userId: string, ws: WebSocket, role: GameRole } }>;

    constructor() {
        this.subscriber = createClient({
            url: REDIS_URL,
        });
        this.publisher = createClient({
            url: REDIS_URL,
        });
        this.users = new Map<string, string[]>();
        this.games = new Map<string, { [userId: string]: { userId: string, ws: any, role: GameRole } }>();

    }

    async connect() {
        await this.subscriber.connect();
        await this.publisher.connect();
    }

    // singleton
    static getInstance() {
        if (!this.instance) {
            this.instance = new GameManager()
        }
        return this.instance;
    }

    async subscribe(gameId: string, userId: string, role: GameRole, ws: any) {

        // so first an http request goes out to get the new gameId then flow reaches here
        // get the game state from db as the game is already created
        const gameState = await db.game.findUnique({
            where: {
                id: gameId,
            },
            select: {
                id: true,
                status: true,
                blackPlayerId: true,
                whitePlayerId: true,
            }
        });

        if (!gameState) {
            return ws.send(JSON.stringify({
                type: MessageType.JOIN_GAME,
                payload: {
                    gameId,
                    msg: `${gameId} does not exist. Please create a new game.`
                }
            }));
        }
        switch (gameState.status) {
            case "MATCHED":
                return ws.send(JSON.stringify({
                    type: MessageType.JOIN_GAME,
                    payload: {
                        gameId,
                        msg: `${gameId} is already matched. Please wait for the game to start.`
                    }
                }));
            //todo: handle cases for game in progress, completed, abandoned
            case "IN_PROGRESS":
                return ws.send(JSON.stringify({
                    type: MessageType.JOIN_GAME,
                    payload: {
                        gameId,
                        msg: `${gameId} is already in progress.`
                    }
                }));

            case "COMPLETED":
                return ws.send(JSON.stringify({
                    type: MessageType.JOIN_GAME,
                    payload: {
                        gameId,
                        msg: `${gameId} is already completed.`
                    }
                }));

        }


        //adding the current palyer to db based on the existing player role
        let playerUpdate = {};

        //first player to join the game
        if (gameState.blackPlayerId == null && gameState.whitePlayerId == null) {
            if(role === GameRole.WHITE) {
                playerUpdate = { whitePlayer: { connect: { id: userId } } };
            } else {
                playerUpdate = { blackPlayer: { connect: { id: userId } } };
            }
            await db.game.update({
                where: {
                    id: gameId,
                },
                data: {
                    status: "NO_MATCH",
                    ...playerUpdate,
                }
            });
            this.games.set(gameId, {
                ...this.games.get(gameId),
                [userId]: {
                    userId,
                    ws,
                    role,
                }
            });

            ws.send(JSON.stringify({
                type: MessageType.JOIN_GAME,
                payload: {
                    gameId,
                    userId,
                    msg: "You have joined the game: " + gameId
                }
            }))

        } else {
            //second player to join the game
            if (gameState.blackPlayerId == null) {
                playerUpdate = { blackPlayer: { connect: { id: userId } } };
            } else if (gameState.whitePlayerId == null) {
                playerUpdate = { whitePlayer: { connect: { id: userId } } };
            }
            await db.game.update({
                where: {
                    id: gameId,
                },
                data: {
                    status: "MATCHED",
                    ...playerUpdate,
                }
            });
            this.games.set(gameId, {
                ...this.games.get(gameId),
                [userId]: {
                    userId,
                    ws,
                    role,
                }
            });

            await Game.getInstance().pushFen(gameId, {
                lan: "",
                fen: DEFAULT_FEN,
            });

            Object.values(this.games.get(gameId) || {}).forEach(({ ws }) => {
                ws.send(JSON.stringify({
                    type: MessageType.INIT_GAME,
                    payload: {
                        gameId,
                        msg: `Game ${gameId} starts`
                    }
                }))
            });
        }



        this.users.set(userId, [
            ...(this.users.get(userId) || []),
            gameId
        ]);


        this.subscriber.subscribe(gameId, async (payload) => {
            console.log(`subscribe ${userId} to ${gameId} as ${role}`);
            const parsePayload = WsMessageParser.parse(JSON.parse(payload.toString()));

            if (parsePayload.type === MessageType.MOVE) {
                const lastMove = await Game.getInstance().getLastMove(gameId);
                try {
                    const subs = this.games.get(gameId) || {};
                    Object.values(subs).forEach(({ ws }) => {
                        ws.send(JSON.stringify({
                            type: MessageType.MOVE,
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

    publish(gameId: string, data: {
        type: MessageType,
        payload: any
    }) {
        console.log(`publishing to ${gameId}`);
        this.publisher.publish(gameId, JSON.stringify(data));
    }

    async move(gameId: string, userId: string, role: GameRole, payload: any, ws: any) {


        // allow publishing only if the role is black or white
        if (this.games.get(gameId)?.[userId]) {
            if ([GameRole.BLACK, GameRole.WHITE].includes(this.games.get(gameId)?.[userId]?.role as GameRole)) {

                await Game.getInstance().move(gameId, userId, role, payload.from, payload.to, ws);
                this.publish(
                    gameId, {
                    type: MessageType.MOVE,
                    payload: payload
                })
            } else {
                ws.send(JSON.stringify({
                    type: MessageType.ERROR,
                    payload: {
                        message: "You are not allowed to make a move",
                        userId,
                        gameId
                    }
                }));
            }
        }
    }

    unsubscribe(userId: string, gameId: string) {

        //todo: given a websocket find the userId and gameId

        this.users.set(userId, [
            ...(this.users.get(userId) || []).filter((id) => id !== gameId)
        ]);
        if (this.users.get(userId)?.length === 0) {
            this.users.delete(userId)
        }

        delete this.games.get(gameId)?.[userId];
        Object.values(this.games.get(gameId) || {}).forEach(({ ws }) => {
            ws.send(JSON.stringify({
                type: MessageType.OPPONENT_DISCONNECTED,
                payload: {
                    gameId,
                    msg: `${userId} has left the game.`
                }
            }));
        });

        if (
            !this.games.get(gameId) ||
            Object.keys(this.games.get(gameId) || {}).length === 0
        ) {
            //todo: save the game state to db by publishing to worker
            this.subscriber.unsubscribe(gameId);
            // removing the channel from the games
            this.games.delete(gameId);
        }
    }
}
