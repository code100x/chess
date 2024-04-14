import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "../config";
import { Role } from "../types/game";
import { MessageType, WsMessageParser } from "../types/message";
import { Game } from "./game";

export class GameRoom {
    public static instance: GameRoom;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;
    private game?: Game;

    // userId: [gameid1, gameid2] -> incase for audience else only one gameid
    private subscriptions: Map<string, string[]>;
    // gameid: { user1: {userId: user1, ws: ws1, role: "black"}, user2: {userId: user2, ws: ws2, role: "white"}, audience: {userId: user3, ws: ws3, role: "audience"}}
    private reverseSubscriptions: Map<string, { [userId: string]: { userId: string, ws: WebSocket, role: Role } }>;

    constructor() {
        this.subscriber = createClient({
            url: REDIS_URL,
        });
        this.publisher = createClient({
            url: REDIS_URL,
        });
        this.subscriptions = new Map<string, string[]>();
        this.reverseSubscriptions = new Map<string, { [userId: string]: { userId: string, ws: any, role: Role } }>();

        this.subscriber.connect();
        this.publisher.connect();
    }

    // singleton
    static getInstance() {
        if (!this.instance) {
            this.instance = new GameRoom()
        }
        return this.instance;
    }

    subscribe(gameId: string, userId: string, role: Role, ws: any) {
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
            // get the role of the user and assign the opposite role
            let role = Object.values(this.reverseSubscriptions.get(gameId) || {})[0]?.role === Role.Black ? Role.White : Role.Black;
            this.reverseSubscriptions.set(gameId, {
                ...this.reverseSubscriptions.get(gameId),
                [userId]: { userId, ws, role }
            });
            this.game = new Game();
        }
        // check if the game already has a user as black and white
        else {
            this.reverseSubscriptions.set(gameId, {
                ...this.reverseSubscriptions.get(gameId),
                [userId]: { userId, ws, role: Role.Audience }
            });
        }

        console.log(this.reverseSubscriptions.get(gameId) || {});


        // to subscribe to the game if already a user is present as black or white
        if (Object.keys(this.reverseSubscriptions.get(gameId) || {}).length === 1) {
            console.log(`subscribe ${userId} to ${gameId} as ${role}`);

            //Todo: publish the state of the game to worker if role is black or white

            this.subscriber.subscribe(gameId, async (payload) => {
                const parsePayload = WsMessageParser.parse(JSON.parse(payload.toString()));

                if (parsePayload.type === MessageType.Move) {
                    // send the move to the user                    
                    try {
                        const subs = this.reverseSubscriptions.get(gameId) || {};
                        Object.values(subs).forEach(({ ws }) => {
                            ws.send(JSON.stringify(parsePayload));
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
    
    move(gameId: string, userId: string, payload: any) {

        //todo: check for checkmate and stalemate, update the payload accordingly

        // allow publishing only if the role is black or white
        if (this.reverseSubscriptions.get(gameId)?.[userId]) {
            if([Role.Black, Role.White].includes(this.reverseSubscriptions.get(gameId)?.[userId]?.role as Role)) {
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

    getMove(gameId: string, userId: string, piece: string, position: string) {
        // use the game object to get the current state of the game and decide
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