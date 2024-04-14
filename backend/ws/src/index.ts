import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import { WSPORT } from "./config";
import cors from "cors";
import { MessageType, WsMessageParser } from "./types/message";
import { GameRoom } from "./redis/connect";

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

wss.on("connection", (ws, req) => {

    //Todo: handle authentication

    ws.on("message", (message) => {
        const data = WsMessageParser.parse(JSON.parse(message.toString()));
        console.log(data);

        if(data.type === MessageType.Join) {
            GameRoom.getInstance().subscribe(data.payload.gameId, data.payload.userId, data.payload.role, ws)
        }
        if(data.type === MessageType.GetMoves) {
            //todo: get the valid moves and send to user
        }
        if(data.type === MessageType.Move) {
            //todo: check for valid move if valid then publish to game queue and if there is checkmate
            GameRoom.getInstance().move(data.payload.gameId, data.payload.userId, data.payload);
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
    
]).then(() => {
    server.listen(WSPORT, async () => {
        console.log(`Server listening on port: ${WSPORT}\n`);
    });
}).catch((error) => {
    console.error('Error while connecting producers:', error);
});