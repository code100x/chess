"use client";
import { useRouter } from "next/navigation";
import{
Dialog,
DialogClose,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
DialogTrigger
} from "@/components/ui/dialog";
import { LoginForm } from "./login-form";

interface LoginButtonProps{
    children:React.ReactNode,
    mode?:"modal" | "redirect"
    asChild?:boolean;
}
export const LoginButton = ({
    children,
    mode="redirect",
    asChild
}:LoginButtonProps ) => {   
    const router = useRouter();

    const onClick = () =>{
    router.push("/auth/login")
    }
    
    if(mode === "modal"){
    return(
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent className="border-none bg- backdrop-blur-sm
            ">
                <LoginForm/>
            </DialogContent>
        </Dialog>
    )
    }

    return ( 
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    );
}


// //Only for checking whether the current user is logged in or not

