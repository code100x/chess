import bcryptjs from "bcryptjs";
import { JWT_ALGO, SALT_ROUNDS } from "@chess/common";
import { SignJWT, importPKCS8, importSPKI, jwtVerify } from "jose";
import { AUTH_JWT_PRIVATE_KEY, AUTH_JWT_PUBLIC_KEY } from "../config";
import { Request, Response } from "express";

/**
 * To create a hash password
 * @param password
 * @returns
 */
export const setHashPassword = async (password: string): Promise<string> => {
    try {
        const hashPassword = await bcryptjs.hash(password, SALT_ROUNDS);
        return hashPassword;
    } catch (error) {
        console.log(error)
        throw Error("Error in hashing password");
    }
};

/**
 * To set JWT cookie
 * @param req 
 * @param res 
 * @param userId 
 * @returns 
 */
export const setJWTCookie = async (
    req: Request,
    res: Response,
    userId: string,
): Promise<string> => {
    const secret = await importPKCS8(AUTH_JWT_PRIVATE_KEY, JWT_ALGO);

    const jwt = await new SignJWT({
        sub: userId,
    })
        .setProtectedHeader({ alg: JWT_ALGO })
        .setIssuer("code100x")
        .setAudience("chess")
        .setIssuedAt()
        .sign(secret);

    setCookieOnResponse(req, res, "jwt", jwt);

    return jwt;
};

export const setCookieOnResponse = (
    req: Request,
    res: Response,
    cookieName: string,
    cookieValue: string,
) => {
    res.cookie(cookieName, cookieValue, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        domain: req.hostname.includes("localhost") ? "localhost" : ".code100x.com",
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });
};


/**
 * @param jwt
 * @returns
 */
export const validateJwt = async (jwt: string) => {
    const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, JWT_ALGO);
    return await jwtVerify(jwt, publicKey, {
        issuer: "code100x",
        audience: "chess",
    });
};

export const clearCookie = (res: Response, cookieName: string) => {
    res.clearCookie(cookieName);
};
