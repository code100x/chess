import { Router } from "express";
import { CACHE_EXPIRY, User, UserSignupSchema, dbResStatus, responseStatus } from "@chess/common";
import { setHashPassword, setJWTCookie } from "../utils/utils";
import { insertUser, queryUserById } from "../db/user";
import { extractUserId } from "../utils/middleware";
import { UserCache } from "../redis/user";

export const userRouter = Router();

/**
 * Create user endpoint
 */
userRouter.post("/", async (req, res) => {
    try {

        const { avatar, email, firstname, lastname, password }
            = UserSignupSchema.parse(req.body);

        const hashPassword = await setHashPassword(password);

        const { status, id, msg } = await insertUser(avatar, email, firstname, lastname, hashPassword);
        if (status == dbResStatus.Error) {
            return res.status(500).json({
                msg,
                status: responseStatus.Error,
            });
        }

        //todo: cache the client data;
        //todo: push the verification process to a messaging queue;
        /**
         * Sign a jwt token
         */
        let jwt: string;
        if (id) {
            jwt = await setJWTCookie(req, res, id);
        } else {
            return res.status(500).json({
                msg: "Error creating user account",
                status: responseStatus.Error,
            });
        }

        return res.status(201).json({
            message: "User created successfully",
            status: responseStatus.Ok,
            user: {
                id,
                jwt
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            //@ts-expect-error
            error: error.message,
            status: responseStatus.Error,
        })
    }
});

/**
 * User me endpoint
 */
userRouter.get('/me' , extractUserId, async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        //@ts-ignore
        const jwt = req.jwt;
        if(id || jwt) {
            // checking cache
            const userCache = await UserCache.getInstance().getUser<User>(id);
            if(userCache) {
                return res.status(302).json({
                    status: responseStatus.Ok,
                    user: {...userCache, jwt} as User
                });
            }

            // fetch the db
            const {user, status, msg} = await queryUserById<User>(id);
            if(status == dbResStatus.Error || !user) {
                return res.status(500).json({
                    status: responseStatus.Error,
                    msg
                });
            };

            // cache the user
            await UserCache.getInstance().cacheUser<User>(id, user, CACHE_EXPIRY);

            return res.status(200).json({
                status: responseStatus.Ok,
                user: {...user, jwt} as User
            });

        }
        return res.status(401).json({
            status: responseStatus.Error,
            msg: "Unauthorized"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            //@ts-expect-error
            error: error.message,
            status: responseStatus.Error,
        })
    }
})