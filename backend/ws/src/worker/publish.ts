import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "../config";
import { WORKER_QUEUE, PublishType } from "@chess/common";

export class Worker {
    private producer: RedisClientType;
    public static instance: Worker;

    constructor() {
        this.producer = createClient({
            url: REDIS_URL,
        });

        this.producer.on("connect", () => {
            console.log(`Redis connect at port: ${REDIS_URL?.split(":").slice(-1)[0]}`)
        });

        this.producer.on("error", (error) => {
            console.error(`Redis error: ${error}`);
        })
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance =  new Worker();
        }
        return this.instance;
    }

    get getProducer() {
        return this.producer;
    }

    async connect() {
        await this.producer.connect();
    }

    async disconnectProducer() {
        await this.producer.disconnect();
        return;
    }

    async publishOne(payload: PublishType) {
        await this.producer.lPush(WORKER_QUEUE, JSON.stringify(payload));
        console.log("payload published successfully");
        return;
    }

    async publishMany(payloads: PublishType[]) {
        await Promise.all(payloads.map(async (payload) => {
            await this.producer.lPush(WORKER_QUEUE, JSON.stringify(payload));
        }));
        return;
    }
}