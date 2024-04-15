"use client";
import { CardWrapper } from "./card-wrapper";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import  {NewPasswordSchema}  from "@/schema";
import { useSearchParams } from "next/navigation";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { useState, useTransition } from "react";
import { newPassword } from "@/actions/new-password";
import {useRouter} from "next/navigation"

export const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const[error,setError] = useState<string | undefined>("");
    const[success,setSuccess] = useState<string | undefined>("");
    const[isPending,startTransition] = useTransition();
    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver:zodResolver(NewPasswordSchema),
        defaultValues:{
            password:"",
        }
    })
    const router = useRouter();

    const onSubmit = (values:z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");
        startTransition(()=>{
        newPassword(values,token).
        then((data) => {
        setError(data?.error);
        setSuccess(data?.success)
        setTimeout(()=>{
            router.push("/auth/login")
        },1000)
        })
        .catch((error)=>{
            setError("Something went wrong")
        })
    })
    }   

    return ( 
        <CardWrapper
        headerLabel = "Enter new Password"
        backButtonlabel = "Back to Login"
        backButtonHref = "/auth/login"
        >
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        >
            <FormField  
            control={form.control}
            name="password"
            render={({field})=>(
                <FormItem>  
                    <FormLabel>
                        Password
                    </FormLabel>
                    <FormControl>
                        <Input
                        className="cursor-pointer backdrop-blur-sm
                        focus-visible:ring-1
                        focus-visible:ring-offset-0"
                        {...field}
                        type="password"
                        placeholder="******"
                        disabled = {isPending}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
            />
            {/* </div> */}
            <FormError message = {error}/>
            <FormSuccess message = {success}/>
            <Button
            size="lg"
            className="w-full hover:bg-slate-900 backdrop-blur-sm cursor-pointer"
            variant="outline" 
            type="submit" 
            >
            {isPending && (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
            )}
            {!isPending && (
                <p>Enter New Password</p>
            )}
            </Button>
        </form>
        </Form>
        </CardWrapper>
    );
}



