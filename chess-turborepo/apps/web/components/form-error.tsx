import { FaExclamation, FaExclamationTriangle } from "react-icons/fa";


interface FormErrorProps{
    message?:string
}

export const FormError = ({
    message,
}:FormErrorProps) =>{
    if(!message) return null;

    return(
        <div className="bg-destructive/15 p-3 rounded-md flex
        items-center gap-x-6 text-sm text-destructive">
        <FaExclamationTriangle className = "h-5 w-5"/>
        <p>{message}</p>
        </div>
    )
}