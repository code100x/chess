import z from "zod";

export enum MessageType {
    Move = "move",
    Join = "join",
    GetMoves = "getMoves",
}

export const WsMessageParser = z.object({
    type: z.nativeEnum(MessageType),
    payload: z.any(),
});