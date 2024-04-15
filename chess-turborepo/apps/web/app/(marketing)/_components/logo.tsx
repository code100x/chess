// writing the logo component over here
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
    return ( 
        <div className="hover:opacity-200/10 transition
        items-center gap-x-2 hidden p-2 md:flex cursor-pointer">
            <Image
            alt = "Logo"
            src = "/logo.png"
            width="50"
            height="50"
            className="object-cover cursor-pointer"
            />
            <Link href="">
            <p className="text-2xl text-white font-semibold 
            text-transparent cursor-pointer backdrop-blur-sm">
            ChessBase
            </p>
            </Link>
        </div>
    );
}

export default Logo;