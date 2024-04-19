import z from "zod";

export enum MessageType {
    MOVE = "move",
    INIT_GAME = "init_game",
    GET_MOVE = "getMoves",
    GET_MATCH = "getMatch",
    GAME_OVER = "game_over",
    JOIN_GAME = "join_game",
    ERROR = "error",
    OPPONENT_DISCONNECTED = "opponent_disconnected",
}

export const WsMessageParser = z.object({
    type: z.nativeEnum(MessageType),
    payload: z.any(),
});