
const express = require('express')
const redis = require('redis')
const app = express();
app.use(express.json());

const client = redis.createClient();
client.on('error', (err:any) => console.log('Redis Client Error', err));


async function startServer() {
    
    try {
        await client.connect();
        console.log("Connected to Redis");

        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();