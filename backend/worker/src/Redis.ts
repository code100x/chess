import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "./config";

export class Redis {
    private client: RedisClientType
    private static instance: Redis

    constructor() {
        this.client = createClient({
            url: REDIS_URL
        });

        this.client.on("connect", () => {
            console.log(`Redis connected at port: ${REDIS_URL?.split(":").slice(-1)[0]}`);
        });

        this.client.on("error", (error) => {
            console.error(`Redis error: ${error}`);
        });
    }

    get getClient() {
        return this.client;
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new Redis();
        }
        return this.instance;
    }

    async popQueue(queue: string): Promise<string> {
        const response = await this.client.brPop(queue, 0);
        return response?.element || "";
    }

    async pushQueue(queue: string, messsage: string) {
        await this.client.lPush(queue, messsage);
    }
}