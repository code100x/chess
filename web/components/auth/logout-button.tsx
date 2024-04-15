"use client";

import { logout } from "@/actions/logout";

interface LogOutButtonProps{
    children:React.ReactNode,
}

export const LogoutButton = ({
    children,
}:LogOutButtonProps) =>{
    const onClick = () =>{
        logout();
    }

    return(
    <span className="cursor-pointer" onClick={onClick}>
        {children}
    </span>
    )
}