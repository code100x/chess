import z from "zod";
import { UserSignupSchema } from "../validations";

export type UserSign = z.infer<typeof UserSignupSchema>

export type User = Omit<UserSign, 'password'> & {
    id: string,
    jwt: string,
    hash_password: string
}