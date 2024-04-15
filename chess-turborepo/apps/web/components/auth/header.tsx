import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"

const font = Poppins({
    subsets:["latin"],
    weight:["600"]
})

interface HeaderSectionProps{
    label:string
}

export const HeaderSection = ({
    label
}:HeaderSectionProps) =>{
    return(
        <div className="w-full flex flex-col gap-y-2 items-center
        justify-center">
            <div className="inline-flex gap-x-2">
        <h1 className={cn("z-10 text-3xl font-semibold bg-clip-text text-transparent text-white",font.className)}>
            ChessBase 
        </h1>
        <span className="text-3xl">♘</span>
        </div>
        <p className="text-muted-foreground text-sm mr-4">
            {label}
        </p>
        </div>
    )
}