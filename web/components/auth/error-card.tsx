import { Card, CardFooter, CardHeader } from "../ui/card"
import { BackButton } from './back-button';
import { HeaderSection } from './header';
import { FaExclamationTriangle } from 'react-icons/fa';


export const ErrorCard = () =>{
    return(
        <div>
        <Card className="w-[400px] backdrop-blur-sm shadow-sm">
        <CardHeader>
        <HeaderSection label="Oops Something went wrong"/>
        </CardHeader>
        <CardFooter className="items-center flex flex-col justify-center w-full gap-y-2">
            <FaExclamationTriangle className = "h-10 w-10"/>
        </CardFooter>
        <CardFooter>
            <BackButton
            label="Click Here -> Back to Login"
            href="/auth/login"
            />
        </CardFooter>
        </Card>
        </div>
    )
}