import { db } from "@/lib/db";

export const getUserByEmail = async(email:string) =>{
    try{
    const user = await db.user.findUnique({
        where:{
            email,
        }
    })
    return user;
    }
    catch{
    return null;
    }
}

export const getUserById = async(id:string) =>{
    try
    {
        const users = await db.user.findUnique({
        where:{
            id
        }
    })
    return users;
    }
    catch{
        return null;
    }
}
