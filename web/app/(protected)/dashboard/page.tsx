import { UserButton } from "@/components/auth/user-button";
import { CurrentUser } from "@/lib/auth";


const DashBoardPage = async() => {
    //fetch current user
    const user = await CurrentUser(); 
    return ( 
        <div className="absolute top-5 right-4">
        <UserButton />
        </div>

    );
}

export default DashBoardPage;