import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";

export const Landing = () => {
    const navigate = useNavigate();
    return <div className="flex justify-center items-center min-h-[100vh]">
        <div className="pt-8 max-w-screen-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="hidden md:flex justify-center">
                    <img src={"/chessboard.jpeg"} className="w-96 h-96 rounded-lg shadow-2xl shadow-[#654e47]" />
                </div>
                <div className="">
                    <div className="flex justify-center">
                        <h1 className="text-4xl md:text-6xl w-[20rem] md:w-full font-bold text-white text-center">Play Chess Online on the #2 Site!</h1>
                    </div>
                    <div className="flex space-x-12 justify-center text-white mt-4 ">
                        <p className="text-zinc-300"><span className="font-bold">13,649,159</span> Games Today</p>
                        <p className="text-zinc-300"><span className="font-bold">659</span> Playing Now</p>
                    </div>

                    <div className="mt-8 space-y-5 flex flex-col justify-center">
                        <Button onClick={() => {
                            navigate("/game/random")
                        }} ><div className="flex gap-4 items-center justify-center min-w-60">
                                <img className="h-12" src="/playwhite.svg" alt="" />

                                <p>Play Online</p>


                            </div>
                        </Button>

                        <Button onClick={() => {
                            navigate("/login")
                        }} >
                           <div className="flex gap-4 items-center justify-center min-w-60">
                                <img className="h-12" src="computer.svg" alt="" />

                                <p>Play Computer</p>


                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}