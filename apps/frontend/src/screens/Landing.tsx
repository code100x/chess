import { PlayCard } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  whitePlayer: { name: string };
  blackPlayer: { name: string };
  result: string;
}

export const Landing = () => {
  const [games, setGames] = useState<Game[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const onLoad = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/v1/games`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setGames(data);
        }
      } catch (e) {
        console.log(e);
        setGames([]);
      }
    };

    onLoad();
  }, []);

  return (
    <div className="max-w-full h-screen chess-board mt-0">
      <div className="flex flex-col md:flex-row w-full md:w-3/4 max-w-screen-lg mx-auto gap-x-4 p-4">
        <img
          className="rounded-xl w-full md:h-3/4  hidden md:block"
          src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713647295/standardboard.1d6f9426_asqzum.png"
          alt="chess-board"
        />
        <PlayCard />
      </div>
      <div>
        {games.length > 0 && (
          <div className="w-[96%] max-w-screen-lg mx-auto mt-20">
            <h1 className="text-6xl text-white font-bold text-left mt-[-10px]">
              Live Games
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
              {games.map((game: Game) => (
                <div className="bg-[#262522] rounded-[36px] p-6" key={game.id}>
                  <h2 className="text-4xl text-white font-bold">
                    {game.whitePlayer.name} vs {game.blackPlayer.name}
                  </h2>
                  <p className="text-xl text-white mt-4">
                    {game.result ? 'Game Over' : 'In Progress'}
                  </p>
                  <Button
                    className="mt-4 text-black rounded-2xl px-4 py-4 bg-black w-full text-3xl flex gap-10 items-center justify-center opacity-90 transition hover:opacity-100"
                    onClick={() => {
                      navigate(`/spectate/${game.id}`);
                    }}
                  >
                    <img
                      className="w-16 h-16"
                      src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713650980/chess-solid-svgrepo-com_qbosf3.svg"
                      alt="icon"
                    />
                    <p className="text-4xl text-white">Spectate</p>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
