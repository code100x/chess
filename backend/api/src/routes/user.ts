import { Router } from "express";
import { UserSignupSchema, dbResStatus, responseStatus } from "@chess/common";
import { setHashPassword, setJWTCookie } from "../utils/utils";
import { insertUser } from "../db/user";

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
        //todo: sign a jwt token and send it to the client; ✔️
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