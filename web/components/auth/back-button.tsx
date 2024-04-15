"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { BiArrowBack } from "react-icons/bi";


interface BackButtonProps{
    label:string,
    href:string
}

export const BackButton = ({
    label,
    href
}:BackButtonProps) =>{
return(
    <Button
    size="sm"
    variant="link"
    className="font-normal w-full z-10 hover:animate-pulse"
    asChild
    >
        <Link href = {href}>
        {/* <BiArrowBack className = "h-5 w-5 text-white"/> */}
            {label}
        </Link>
    </Button>
)
}