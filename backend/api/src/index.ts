import express from "express"
import { API_PORT } from "./config";
import cors from "cors";
import morgan from "morgan";
import { userRouter } from "./routes/user";
import { UserCache } from "./redis/user";
import { gameRouter } from "./routes/game";
import { extractUserId } from "./utils/middleware";

const app = express();

app.use(express.json());
app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms"),
);

export const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: "Content-Type, Authorization, Content-Encoding",
};

app.use(cors(corsOptions));

app.get('/', (_, res) => {
    return res
        .status(200)
        .json({
            uptime: process.uptime(),
            message: "Api service running...",
            timestamp: new Date().toISOString(),
        });
});

app.get('/health', (_, res) => {
    return res
        .status(200)
        .json({
            uptime: process.uptime(),
            message: "Api service running...",
            timestamp: new Date().toISOString(),
        });
});

app.use('/user', userRouter);
app.use('/game', extractUserId, gameRouter);

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
    process.exit(1);
});

Promise.all([
    new Promise((resolve, reject) => {
        UserCache.getInstance().getClient.connect().then(() => {
            resolve(true);
        }).catch((error) => {
            reject(error);
        });
    }),
]).then(() => {
    app.listen(API_PORT, async () => {
        console.log(`Server listening on port: ${API_PORT}\n`);
    });
}).catch((error) => {
    console.error('Error while connecting producers:', error);
});