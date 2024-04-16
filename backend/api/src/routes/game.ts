import { InitNewGameSchema, dbResStatus, responseStatus } from "@chess/common";
import { Router } from "express";
import { insertGame } from "../db/game";

export const gameRouter = Router();

gameRouter.get('/', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if(id) {
            const {role} = InitNewGameSchema.parse(req.query);

            const {status, gameId, msg} = await insertGame(role, id);
            if (status == dbResStatus.Error) {
                return res.status(500).json({
                    msg,
                    status: responseStatus.Error,
                });
            }

            return res.status(200).json({
                gameId,
                status: responseStatus.Ok
            });
        }
        return res.status(401).json({
            status: responseStatus.Error,
            msg: "Unauthorized"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Internal server error",
            error,
            status: responseStatus.Error
        })
    }
})