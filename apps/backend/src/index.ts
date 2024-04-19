import express from "express";
import v1Router from "./router/v1";
import cors from "cors";
import { initPassport } from "./passport";
import authRoute from "./router/auth";
import dotenv from "dotenv";
import session from 'express-session';
import passport from "passport";

const app = express();

dotenv.config();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 360000}
}));

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate('session'));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);
app.use("/v1", v1Router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
