import { Chain } from "@chess/zeus";
import { HASURA_ADMIN_SERCRET, HASURA_URL, JWT } from "../config";
import { GameRole, User, dbResStatus } from "@chess/common";

export const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});

/**
 * 
 * @param gameId 
 * @param playerId 
 * @param role 
 * @returns 
 */
export const addPlayer = async (
    gameId: string,
    playerId: string,
    role: GameRole.Black | GameRole.White
): Promise<{
    status: dbResStatus,
    id?: string,
    msg?: string
}> => {
    try {
        let setPlayer;
        if(role === GameRole.Black) {
            setPlayer = {
                black_player_id: playerId,
                status: "matched"
            }
        } else {
            setPlayer = {
                white_player_id: playerId,
                status: "matched"
            }
        }
        const response = await chain("mutation")({
            update_game: [{
                where: {
                    id: {_eq: gameId}
                },
                _set: setPlayer
            }, {
                returning: {
                    id: true
                }
            }]
        }, {operationName: "update_game"});
        if(response.update_game?.returning[0]?.id) {
            return {
                status: dbResStatus.Ok,
                id: response.update_game.returning[0].id as string
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