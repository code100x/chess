import { FaCheckCircle } from "react-icons/fa";


interface FormSuccessProps{
    message?:string
}

export const FormSuccess = ({
    message,
}:FormSuccessProps) =>{
    if(!message) return null;

    return(
        <div className="bg-emerald-500/15 p-3 rounded-md flex
        items-center gap-x-6 text-sm text-green-500">
        <FaCheckCircle className = "h-5 w-5"/>
        <p>{message}</p>
        </div>
    )
}