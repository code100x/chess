import { MessageType } from "./enum";
import { z } from "zod";

export const WsMessageParser = z.object({
    type: z.nativeEnum(MessageType),
    payload: z.any(),
});