import { useNavigate } from "react-router-dom"
import { Button } from "../components/Button";
import BackgroundSvg from "../components/BackgroundSvg";

export const Landing = () => {
    const navigate = useNavigate();
    return <div className="flex justify-center overflow-hidden relative h-full">
        <BackgroundSvg/>
        <div className="grid content-center py-8 max-w-screen-xl z-[1]">
            <div className="grid grid-cols-1 grid-rows-[max-content] lg:grid-rows-[auto] gap-4 lg:grid-cols-3 px-4 py-8 lg:p-8 h-full">
                <div className="lg:col-span-2 flex justify-center items-center">
                         <img src={"/chessboard.jpeg"} className="w-2/3 lg:w-3/4 aspect-square animate-glow object-scale-down" />
                </div>
                <div className="lg:pt-16 p-4 lg:p-0 grid content-center">
                    <div className="flex justify-center">
                        <h1 className="text-3xl xl:text-5xl text-center font-bold text-white">Play chess online on the #2 Site!</h1>
                    </div>

                    <div className="m-2 lg:mt-8 grid gap-4 xl:grid-flow-col">
                        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-0.5 rounded-[6px] duration-500 shadow-[-30_0_1rem_-1rem,0_0_1rem_-1rem] hover:shadow-[-1rem_0_2rem_-0.5rem,1rem_0_2rem_-0.5rem] hover:shadow-orange-400">

                        <Button className="w-full bg-slate-950 rounded-[5px] px-4 duration-300 transition-colors hover:bg-black/80 font-medium" onClick={() => {
                            navigate("/game/random")
                        }} >
                            Play Online
                        </Button>
                            </div>
                   
                          <Button className="rounded-[6px] h-auto hover:bg-green-600 duration-300 font-medium"  onClick={() => {
                            navigate("/login")
                        }} >
                            Login
                        </Button>
                    </div>    
                </div>
            </div>
        </div>
    </div>
}