import { useNavigate } from 'react-router-dom';
// import { Button } from '../components/Button';
import { Button } from '@/components/ui/button';

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-[#302E2B] mx-auto">
      <header className="bg-[#262522] font-mono text-white pt-8 pb-9 w-full shadow-lg">
        <div className="w-[96%] max-w-screen-lg mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex">
              <img
                className="w-8 h-8 mt-[-5px]"
                src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713654408/chess-svgrepo-com_m9g5p1.svg"
              />
              <h2 className="text-2xl">chess.100x</h2>
            </div>

            <div className="flex gap-6 lg:gap-14 items-center">
              <Button
                className="text-white text-lg lg:text-xl px-0 py-0 bg-transparent"
                onClick={() => {
                  navigate('/game/random');
                }}
              >
                Play Online
              </Button>

              <Button
                className="text-white text-lg lg:text-xl px-0 py-0 bg-transparent"
                // onClick={() => {
                //   navigate('/login');
                // }}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="w-[96%] max-w-screen-lg mx-auto">
        <div className="mt-[4rem] lg:mt-[8rem] flex flex-col-reverse lg:grid lg:grid-cols-[45%,1fr] gap-20 lg:gap-28">
          <div>
            <h1 className="text-6xl text-white font-bold text-left mt-[-10px]">
              Your Ultimate <br />
              <span className="text-8xl">CHESS</span>
              <br /> Destination
            </h1>
            <p className="text-xl mt-6 text-white">
              Chess.100x is your premier destination for mastering the timeless
              game of chess. Whether you're a beginner looking to learn the
              basics or an experienced player aiming to sharpen your skills.
            </p>

            <Button
              className="mt-10 text-black rounded-2xl px-4 py-4 bg-black w-full text-3xl flex gap-10 items-center justify-center opacity-90 transition hover:opacity-100"
              onClick={() => {
                navigate('/game/random');
              }}
            >
              <img
                className="w-16 h-16"
                src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713650980/chess-solid-svgrepo-com_qbosf3.svg"
                alt="icon"
              />
              <p className="text-4xl">Play Online</p>
            </Button>
          </div>
          <div>
            <img
              className="rounded-2xl"
              src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713647295/standardboard.1d6f9426_asqzum.png"
              alt="chess-board"
            />
          </div>
        </div>
      </div>
      <div className="mt-32 bg-[#262522] w-[96%] max-w-screen-lg mx-auto px-14 py-14 rounded-[36px]">
        <div className="lg:grid grid-cols-[45%,1fr] gap-28">
          <div className="rounded-xl">
            <img
              src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713657312/undraw_questions_re_1fy7_kqjpu3.svg"
              alt="chess-board"
            />
          </div>
          <div className="mt-16 lg:mt-0">
            <h1 className="text-6xl text-white font-bold text-left mt-[-10px]">
              Found an Issue!
            </h1>
            <p className="text-xl mt-6 text-white">
              Please create an issue in our github website below. You are also
              invited to contribute on the project.
            </p>

            <a
              href="https://github.com/code100x/chess/issues"
              target="_blank"
              className="mt-10 text-white rounded-2xl px-4 py-4 border border-slate-400 bg-transparent w-full text-2xl flex gap-10 items-center justify-center"
            >
              <img
                className="w-16 h-16"
                src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713657100/github-svgrepo-com_uosbko.svg"
                alt="icon"
              />
              <p className="text-4xl">Github</p>
            </a>
          </div>
        </div>
      </div>
      <footer className="mt-40 border-t border-gray-600 py-16 text-white">
        <div className="w-[96%] max-w-screen-lg mx-auto flex flex-row justify-between">
          <div className="flex">
            <img
              className="w-8 h-8 mt-[-5px]"
              src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713654408/chess-svgrepo-com_m9g5p1.svg"
            />
            <h2 className="text-2xl text-white">chess.100x</h2>
          </div>
          <div>
            <p>Follow On</p>
            <div className="flex gap-3 mt-4">
              <a href="https://github.com/hkirat" target="_blank">
                <img
                  className="w-10 h-10"
                  src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713657100/github-svgrepo-com_uosbko.svg"
                  alt="icon"
                />
              </a>
              <a href="https://www.youtube.com/@harkirat1" target="_blank">
                <img
                  className="w-10 h-10"
                  src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713658274/youtube-svgrepo-com_g2j3ac.svg"
                  alt="icon"
                />
              </a>
              <a href="https://twitter.com/kirat_tw" target="_blank">
                <img
                  className="w-10 h-10"
                  src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713658566/twitter-x_p3lis9.svg"
                  alt="icon"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
