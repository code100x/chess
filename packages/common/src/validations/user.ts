import z from "zod";

export const UserSignupSchema = z.object({
    firstname: z
        .string()
        .regex(
            /^[A-Z][a-z]+(-[A-Z][a-z]+)?$/,
            "should start with a capital letter and can only contain lowercase letters. Hyphenated names should have a capital letter after the hyphen.",
        ),

    lastname: z
        .string()
        .regex(
            /^[A-Z][a-z]+(-[A-Z][a-z]+)?$/,
            "should start with a capital letter and can only contain lowercase letters. Hyphenated names should have a capital letter after the hyphen.",
        ),

    email: z.string().email(),
    
    password: z
        .string()
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,20}$/,
            "should be 8 to 20 characters long with at least one lowercase letter, one uppercase letter, one digit, and one special character",
        ),
    
    avatar: z.string().url().nullable(),
});