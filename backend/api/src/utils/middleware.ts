import { NextFunction, Request, Response } from "express";
import { clearCookie, validateJwt } from "./utils";
import { responseStatus } from "@chess/common";

/**
 * Middleware to extract user id from jwt
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const extractUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let jwt = "";

    // Header takes precedence
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.split(" ")[0] === "Bearer") {
        //@ts-ignore
        jwt = authHeader.split(" ")[1];
    } else if (req.cookies.jwt) {
        jwt = req.cookies.jwt;
    } else if (req.query.jwt) {
        jwt = req.query.jwt as string;
    }

    if(jwt) {
        try {
            const payload = await validateJwt(jwt);
            if(payload.payload.sub) {
                //@ts-ignore
                req.id = payload.payload.sub;
                //@ts-ignore
                req.jwt = jwt;
            }
        } catch (error) {
            clearCookie(res, "jwt");
            return res.status(401).json({
                error: "Unauthorized, Jwt error",
                status: responseStatus.Error,
            });
        }
    } else {
        return res.status(401).json({
            error: "Unauthorized, No jwt provided",
            status: responseStatus.Error,
        });
    }
    next();
}