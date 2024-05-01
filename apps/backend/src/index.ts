import express from 'express';
import v1Router from './router/v1';
import cors from 'cors';
import { initPassport } from './passport';
import authRoute from './router/auth';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';

const app = express();

dotenv.config();
app.use(
  session({
    secret: process.env.COOKIE_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  }),
);

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate('session'));

const allowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(',')
  : [];

app.use(
  cors({
    origin: allowedHosts,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  }),
);

app.use('/auth', authRoute);
app.use('/v1', v1Router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
