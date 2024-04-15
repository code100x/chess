"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { BackButton } from "./back-button";
import { HeaderSection } from "./header";
import { Social } from "./social";
import {motion} from "framer-motion";

interface CardWrapperProps{
    children:React.ReactNode
    headerLabel:string
    backButtonlabel:string
    backButtonHref:string
    showSocial?:boolean
}

export const CardWrapper = ({
    children,
    headerLabel,
    backButtonlabel,
    backButtonHref,
    showSocial
}:CardWrapperProps) => {
    return ( 

            <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.4 }}
            >
            <Card className="w-[400px] shadow-md backdrop-blur-sm bg-black">
            <CardHeader>
            <HeaderSection label = {headerLabel}/>
            </CardHeader>
        <CardContent>
        {children}
        </CardContent>
        {showSocial && (
            <CardFooter>
                <Social/>
            </CardFooter>
        )}
        <CardFooter>
            <BackButton
            label = {backButtonlabel}
            href = {backButtonHref}
            />
        </CardFooter>
        </Card>
        </motion.div>

    );
} 
