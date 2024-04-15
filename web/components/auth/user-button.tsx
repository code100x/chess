"use client";

import { LogOut } from 'lucide-react';
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuGroup,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
Avatar,
AvatarImage,
AvatarFallback
} from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";
import { Button } from "../ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "./logout-button";


export const UserButton = () =>{
    const user = useCurrentUser();
    return(
       <DropdownMenu>
             <DropdownMenuTrigger>
                 <Avatar>
                     <AvatarImage src={user?.image || ""}/>
                        <AvatarFallback className="bg-purple-400">
                        <FaUser className = "text-white"/>
                        </AvatarFallback>
                 </Avatar>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-40">
                <LogoutButton>
                <DropdownMenuItem className=' cursor-pointer'>
                <LogOut className = "h-5 w-5 mr-2"/>
                LogOut
                </DropdownMenuItem>
                </LogoutButton>
             </DropdownMenuContent>
         </DropdownMenu>
    )
}

