import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import { WSPORT } from "./config";
import cors from "cors";
import { MessageType, WsMessageParser } from "./types/message";
import { GameRoom } from "./redis/connect";
import { Game } from "./redis/game";
import { Worker } from "./worker/publish";

const app = express();

const server = http.createServer(app);

const wss = new WebSocketServer({ server })

app.use(express.json());

const corsOptions = {
    origin: "*", 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: "Content-Type, Authorization",
};

app.use(cors(corsOptions));

app.get("/", (_req, res) => {
    return res.status(200).json({
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
    });
});

app.get("/_health", (_req, res) => {
    return res.status(200).json({
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
    });
});

wss.on("connection", (ws, _) => {

    //Todo: handle authentication

    ws.on("message", async (message) => {
        const data = WsMessageParser.parse(JSON.parse(message.toString()));

        if(data.type === MessageType.GetMatch) {
            await GameRoom.getInstance().getMatch(data.payload, ws);
        }

        if(data.type === MessageType.Join) {
            await GameRoom.getInstance().subscribe(data.payload.gameId, data.payload.userId, data.payload.role, ws)
        }
        if(data.type === MessageType.GetMoves) {
            await Game.getInstance().getLegalMoves(data.payload.gameId, data.payload.pos).then((moves) => {
                ws.send(JSON.stringify({
                    type: MessageType.GetMoves,
                    payload: moves || []
                }));
            });
        }
        if(data.type === MessageType.Move) {
            //todo: check for valid move if valid then publish to game queue and if there is checkmate
            await GameRoom.getInstance().move(data.payload.gameId, data.payload.userId, data.payload);
        }

    });

    ws.on("close", () => {
        //todo: handle error
    });
})

process.on("uncaughtException", function (err) {
    console.log("Caught exception: " + err);
});

process.on("unhandledRejection", function (reason, _promise) {
    console.log("Unhandled Rejection at:", reason);
});

Promise.all([
    new Promise((resolve, reject) => {
        GameRoom.getInstance().connect().then(() => {
            resolve(true);
        }).catch((error) => {
            reject(error);
        });
    }),
    new Promise((resolve, reject) => {
        Game.getInstance().connect().then(() => {
            resolve(true);
        }).catch((error) => {
            reject(error);
        });
    }),
    new Promise((resolve, reject) => {
        Worker.getInstance().connect().then(() => {
            resolve(true);
        }).catch((error) => {
            reject(error);
        });
    }),
]).then(() => {
    server.listen(WSPORT, async () => {
        console.log(`Server listening on port: ${WSPORT}\n`);
    });
}).catch((error) => {
    console.error('Error while connecting producers:', error);
});