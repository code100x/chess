import { Chain } from "@chess/zeus";
import { HASURA_ADMIN_SERCRET, HASURA_URL, JWT } from "../config";
import { User, dbResStatus } from "@chess/common";

export const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});

export const insertUser = async (
    avatar: string | null,
    email: string,
    firstname: string,
    lastname: string,
    password: string
): Promise<{
    status: dbResStatus,
    id?: string,
    msg?: any
}> => {
    try {
        
        const response = await chain("mutation")({
            insert_user_one: [{
                object: {
                    avatar,
                    email,
                    firstname,
                    lastname,
                    hash_password: password,
                }
            }, {
                id: true
            }]
        }, {operationName: "insert_user_one"});
        if(response.insert_user_one?.id) {
            return {
                status: dbResStatus.Ok,
                id: response.insert_user_one.id as string
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

/**
 * get user by id
 * @param id 
 * @returns 
 */
export const queryUserById = async<T extends User>(
    id: string
): Promise<{
    status: dbResStatus,
    user?: T,
    msg?: string
}> => {
    try {
        const response = await chain("query")({
            user: [{
                limit: 1,
                where: {
                    id: {_eq: id}
                }
            }, {
                id: true,
                avatar: true,
                email: true,
                firstname: true,
                lastname: true,
                hash_password: true,
            }]
        }, {operationName: "user"});
        if(response.user[0]?.id) {
            return {
                status: dbResStatus.Ok,
                user: response.user[0] as T
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