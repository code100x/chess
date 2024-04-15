import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import { REDIS_URL } from "../config";
import { User } from "@chess/common";

export class UserCache {
    private client: RedisClientType;
    private static instance: UserCache;

    constructor() {
        this.client = createClient({
            url: REDIS_URL,
        });

        this.client.on("connect", () => {
            console.log(`Redis connect at port: ${REDIS_URL?.split(":").slice(-1)[0]}`)
        });

        this.client.on("error", (error) => {
            console.error(`Redis error: ${error}`);
        })
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new UserCache();
        }
        return this.instance;
    }

    get getClient() {
        return this.client;
    }

    async cacheUser<T extends User>(key: string, item: T, expire: number): Promise<void> {
        try {
            await this.client
                .hSet(key, {
                    id: item.id,
                    email: item.email,
                    firstname: item.firstname,
                    lastname: item.lastname,
                    hash_password: item.hash_password,
                    avatar: item.avatar || ""
                });

            await this.client.expire(key, expire);
            console.log(`Cached with key ${key}`);
            return;
        } catch (error) {
            console.error("Error caching user: ", error);
            return;
        }
    }

    async getUser<T>(key: string): Promise<T | null> {
        try {
            const user = await this.client.hGetAll(key);
            return {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                hash_password: user.hash_password,
                avatar: user.avatar || null,
            } as T;
        } catch (error) {
            console.error("Error getting user: ", error);
            return null;
        }
    }

}