//Similarly to be done for server actions 
"use server";

import { CurrentRole } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export const admin = async() => {
    const role = await CurrentRole();
    if(role!==UserRole.ADMIN){
        return{
            error:"Only Admins are allowed over here"
        }
    }
    return{
        success:"You are allowed to access Server Actions"
    }
}