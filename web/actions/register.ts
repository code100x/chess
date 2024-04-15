"use server";

import {RegisterSchema} from "@/schema";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const Register = async(values:z.infer<typeof RegisterSchema>) =>{
    
    const validatedFields = RegisterSchema.safeParse(values);
    if(!validatedFields.success){
        return{
            error:"Invalid Fields"
        }
    }
    const {email,name,password,confirm_password} = validatedFields.data;
    
    if(confirm_password!==password){
        return{
            error:"Invalid Credentials"
        }
    }
    
    const hashedPassword = await bcrypt.hash(password,10);
    const hashedConfirmPassword = await bcrypt.hash(confirm_password,10);    
    const existingUser = await getUserByEmail(email);

    if(existingUser){
        return{
            error:"Email Already exists"
        }
    }


    await db.user.create({
        data:{
            name,
            email,
            password:hashedPassword,
            confirm_password:hashedConfirmPassword,
        }
    })

    const verificationToken = await generateVerificationToken(email);
    
    //sending verification email
    await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
    )
    


    //If the details are validated then we have as
    return {
        success: "Confirmation email sent"
    }   
    
}