"use server"
import * as z from "zod";
import { db } from "@/lib/db";
import { ResetSchema } from "@/schema";
import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/mail";

export const reset = async(values:z.infer<typeof ResetSchema>) => {
    const validatedFields = ResetSchema.safeParse(values)
    if(!validatedFields.success){
        return{
            error:"Invalid fields"
        }
    }
    //but if they are validated then
    const {email} = validatedFields.data;
    const existingUser = await getUserByEmail(email);
    if(!existingUser){
        return{
            error:"Email doesn't exist"
        }
    }
    //send the emails
    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token
    )

    return{
        success:"Email sent!"
    }
}