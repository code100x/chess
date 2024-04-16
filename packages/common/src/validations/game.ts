import z from "zod";
import { GameRole } from "../enums";

export const InitNewGameSchema = z.object({
    role: z.enum([GameRole.Black, GameRole.White]),
})