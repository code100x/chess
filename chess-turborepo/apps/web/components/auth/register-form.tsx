"use client";
import { CardWrapper } from "./card-wrapper";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import  {RegisterSchema}  from "@/schema";
import {motion} from "framer-motion";

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
import { Register } from "@/actions/register";
import { useState, useTransition } from "react";

export const RegisterForm = () => {
    const[error,setError] = useState<string | undefined>("");
    const[success,setSuccess] = useState<string | undefined>("");
    const[isPending,startTransition] = useTransition();
    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver:zodResolver(RegisterSchema),
        defaultValues:{
            email:"",
            password:"",
            confirm_password:"",
            name:""
        }
    })

    const onSubmit = (values:z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");
        startTransition(()=>{
        Register(values).
        then((data) => {
        setError(data.error);
        setSuccess(data.success)
        })
    })
    }

    return ( 
        <CardWrapper
        headerLabel = "Create An Account"
        backButtonlabel = "Already have an account?"
        backButtonHref = "/auth/login"
        showSocial
        >   
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        >
            <FormField  
            control={form.control}
            name="email"
            render={({field})=>(
                <FormItem>  
                    <FormLabel>
                        Email
                    </FormLabel>
                    <FormControl>
                        <Input
                        className="cursor-pointer backdrop-blur-sm
                        focus-visible:ring-1
                        focus-visible:ring-offset-0"
                        {...field}
                        type="email"
                        placeholder="john@gmail.com"
                        disabled = {isPending}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
            />
            <FormField  
            control={form.control}
            name="name"
            render={({field})=>(
                <FormItem>  
                    <FormLabel>
                        Name
                    </FormLabel>
                    <FormControl>
                        <Input
                        className="cursor-pointer backdrop-blur-sm
                        focus-visible:ring-1
                        focus-visible:ring-offset-0"
                        {...field}
                        type="name"
                        placeholder="John Doe"
                        disabled = {isPending}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
            />
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
                        placeholder="*******"
                        disabled = {isPending}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
            />
            <FormField  
            control={form.control}
            name="confirm_password"
            render={({field})=>(
                <FormItem>
                    <FormLabel>
                        Confirm Password
                    </FormLabel>
                    <FormControl>
                        <Input
                        className="cursor-pointer backdrop-blur-sm
                        focus-visible:ring-1
                        focus-visible:ring-offset-0"
                        {...field}
                        type="password"
                        placeholder="*******"
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
            <motion.button
             whileHover={{ scale: 1 }}
             whileTap={{ scale: 0.9 }}
             className="w-full"
             >
            <Button
            size="lg"
            className="w-full hover:bg-slate-900 backdrop-blur-sm cursor-pointer"
            variant="outline" 
            type="submit"  
            disabled = {isPending}
            >
            {isPending && (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
            )}
            {!isPending && (
                <p>Register</p>
            )}
            </Button>
            </motion.button>
        </form>
        </Form>
        </CardWrapper>
    );
}



