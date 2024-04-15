"use client";

import { Button } from "../ui/button";
import {FcGoogle} from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import {motion} from "framer-motion";
import { useSearchParams } from 'next/navigation';
 

export const Social = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");
const onClick = (providers:"google" | "github") => {
    signIn(providers,{
        callbackUrl:callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
}

    return(
    <div className="flex items-center w-full gap-x-2">
    <motion.button
    whileHover={{ scale: 1 }}
    whileTap={{ scale: 0.9 }}
    className="w-full"
    >
    <Button
    size="lg"
    className="w-full cursor-pointer hover:bg-slate-900 z-10"
    variant="outline"
    onClick={() => onClick("google")}
    >
    <FcGoogle className="h-5 w-5"/>
    </Button>
    </motion.button>
    <motion.button
    whileHover={{ scale: 1 }}
    whileTap={{ scale: 0.9 }}
    className="w-full"
    >
    <Button
    size="lg"
    className="w-full hover:bg-slate-900 z-10"
    variant="outline"
    onClick={()=>onClick("github")}
    >
    <FaGithub className="h-5 w-5" />
    </Button>
    </motion.button>
    </div>
    )
}