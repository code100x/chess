import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import BackgroundSvg from "../components/BackgroundSvg";
import { Button } from "../components/Button";

export const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-between min-h-screen">
            <Navbar navigate={navigate} />
            <main className="flex flex-1 justify-center overflow-hidden relative">
                <BackgroundSvg />
                <div className="py-8 max-w-screen-xl z-[1]">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 h-full">
                        <div className="col-span-2 flex justify-center items-center">
                            <img src={"/chessboard.jpeg"} className="max-w-screen-sm rounded-2xl animate-glow" />
                        </div>
                        <div className="pt-16">
                            <div className="flex justify-center">
                                <h1 className="text-4xl font-bold text-white">Play chess online on the #2 Site!</h1>
                            </div>
                            <div className="mt-8 flex space-x-5 justify-center">
                                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-0.5 rounded-[6px] duration-500 shadow-[-30_0_1rem_-1rem,0_0_1rem_-1rem] hover:shadow-[-1rem_0_2rem_-0.5rem,1rem_0_2rem_-0.5rem] hover:shadow-orange-400">
                                    <Button className="bg-slate-950 rounded-[5px] px-4 duration-300 transition-colors hover:bg-black/80 font-medium" onClick={() => {
                                        navigate("/game/random")
                                    }} >
                                        Play Online
                                    </Button>
                                </div>
                                <Button className="rounded-[6px] h-auto bg-gray-200 text-black px-4 py-2 hover:bg-green-600 duration-300 font-medium" onClick={() => {
                                        navigate("/login")
                                    }}>
                                        Login
                                    </Button>
                            </div>    
                        </div>
                    </div>
                </div>
            </main>
            <LearnChessSection />
            <VintageInfoSection />
            <Footer navigate={navigate} />
        </div>
    );
}

const Navbar = ({ navigate }) => {
    return (
        <nav className="bg-black text-white p-4">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">ChessMaster</Link>
                <Button className="text-white bg-transparent hover:bg-white hover:text-black transition duration-300 px-4 py-2 rounded" onClick={() => navigate("/login")}>Login</Button>
            </div>
        </nav>
    );
};

const LearnChessSection = () => {
    return (
        <section className="p-8 -mt-32 bg-black">
            <div className="max-w-screen-xl mx-auto text-center">
                <h2 className="text-2xl font-bold mt-28 text-white mb-4">Learn basic Chess</h2>
                <div className="aspect-video mt-10 shadow-orange-50 rounded-2xl flex justify-center">
                    <iframe
                        style={{ width: '80%', height: '450px' }}
                        src="https://www.youtube.com/embed/OCSbzArwB10"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                </div>
            </div>
        </section>
    );
};

const VintageInfoSection = () => {
    return (
        <section className="bg-gray-900 text-white py-16 flex flex-wrap items-center justify-center gap-12">
            <div className="flex-1 min-w-[40%] flex justify-center">
                <img src="/chess1.jpeg" alt="Chess History" className="max-w-full ml-6 h-auto rounded-xl shadow-2xl transform hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex-1 min-w-[40%]">
                <h2 className="text-4xl font-extrabold mb-6 text-center md:text-left">The Rich History of Chess</h2>
                <p className="text-xl leading-relaxed">Originating in India around the 6th century AD, chess has traversed through cultures and continents, evolving into the strategic game we cherish today. Dive into the lore of ancient strategies and grandmaster battles, and elevate your understanding and appreciation of chess.</p>
            </div>
        </section>
    );
};

const Footer = ({ navigate }) => {
    return (
        <footer className="bg-gray-800 text-white py-10">
            <div className="max-w-screen-xl mx-auto text-center">
                <h3 className="text-2xl font-bold mb-5">Join the ChessMaster Community</h3>
                <p className="mb-6">Enhance your skills, learn new strategies, and connect with other chess enthusiasts. Keep up with all things chess by following us on our social platforms.</p>
                <button className="bg-white hover:bg-blue-800 text-black font-bold py-2 px-6 rounded-lg transition-colors duration-300" onClick={() => navigate("/login")}>Login</button>
                <p className="mt-8 text-sm">© 2024 ChessMaster. All rights reserved.</p>
            </div>
        </footer>
    );
};




export default Landing;
