"use server"
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db"
import { NewPasswordSchema } from "@/schema"
import * as z from "zod";
import bcrypt from 'bcryptjs';

export const newPassword = async(
    values:z.infer<typeof NewPasswordSchema>,
    token?:string|null
) =>{
    if(!token){
        return{
            error:"Missing token"
        }
    }

    const validatedFields = NewPasswordSchema.safeParse(values);
    if(!validatedFields.success){
        return{
            error:"Invalid Fields"
        }
    }

    const {password} = validatedFields.data;
    const existingToken = await getPasswordResetTokenByToken(token);
    if(!existingToken){
        return{
            error:"Token doesn't exist"
        }
    }

    //create new token
    const hasExpired = new Date(existingToken.expires) < new Date()
    if(hasExpired){
        return{
            error:"Token has expired"
        }
    }
    
    const existingUser = await getUserByEmail(existingToken.email);
    if(!existingUser){
        return{
            error:"Email does not exist"
        }
    }
    const hashPassword = await bcrypt.hash(password,10);

    await db.user.update({
        where:{
            id:existingUser.id,
        },
        data:{
            password:hashPassword
        }
    })

    await db.passwordResetToken.delete({
        where:{
        id: existingToken.id
        }
    })

    return {
        success:"Password updated"
    }
}