import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import { WSPORT } from "./config";
import cors from "cors";

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