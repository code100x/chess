import z from "zod";

export const AddMovePayloadParse = z.object({
    //todo: add regex or refine to check for valid uuid
    gameId: z.string(),
    moveNumber: z.number(),
    from: z.string(),
    to: z.string(),
    //todo: add regex or refine to check for valid uuid
    startFen: z.string(),
    //todo: add regex or refine to check for valid uuid
    endFen: z.string(),
    createdAt: z.date(),
});