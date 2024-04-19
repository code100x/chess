import express from "express"
import v1Router from "./router/v1";

const app = express();

app.use("/v1", v1Router);