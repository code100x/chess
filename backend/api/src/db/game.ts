import { Chain } from "@chess/zeus";
import { HASURA_ADMIN_SERCRET, HASURA_URL, JWT } from "../config";
import { GameRole, User, dbResStatus } from "@chess/common";

export const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});

export const insertGame = async (
    role: GameRole.Black | GameRole.White,
    userId: string,
): Promise<{
    status: dbResStatus,
    msg?: string,
    gameId?: string
}> => {
    try {
        const response = await chain("mutation")({
            insert_game_one: [{
                object: {
                    [role === GameRole.Black ? "black_player_id" : "white_player_id"]: userId
                }
            }, {
                id: true
            }]
        }, {operationName: "insert_game_one"});
            
        if(response.insert_game_one?.id) {
            return {
                status: dbResStatus.Ok,
                gameId: response.insert_game_one.id as string
            }
        }
    } catch (error: any) {
        console.log(error);
        return {
            status: dbResStatus.Error,
            msg: error.response.errors[0].message
        }
    }
    return {
        status: dbResStatus.Error,
        msg: "Database error"
    }
}