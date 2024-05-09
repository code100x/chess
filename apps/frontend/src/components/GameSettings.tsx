import { formatResult } from '../utils/formatResult';
import { formatDate } from '../utils/formatTime';
import { GroupIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

//@ts-ignore
const GameSettings = ({ userInfo }) => {
  const gamesPerPage = 5;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const games = [...userInfo.gamesAsWhite, ...userInfo.gamesAsBlack];

  const totalGames = games.length;

  let w: number = 0,
    b: number = 0;

  //@ts-ignore
  userInfo.gamesAsBlack.map((data) => {
    if (data.result === 'BLACK_WINS') {
      b++;
    }
  });

  //@ts-ignore
  userInfo.gamesAsWhite.map((data) => {
    if (data.result === 'WHITE_WINS') {
      w++;
    }
  });

  const winPercentage = totalGames ? ((w / totalGames) * 100).toFixed(2) : 0;
  //@ts-ignore
  games.sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = games.slice(indexOfFirstGame, indexOfLastGame);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="text-white">
      <div className="overflow-x-auto rounded-md shadow-md">
        <div className="mb-10">
          <div className="flex items-center mb-4 border-b border-white pb-4">
            <div className="rounded-full bg-stone-800 p-3 mr-4">
              <GroupIcon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">Game Statistics</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-center rounded-lg bg-stone-900 p-6 shadow-md">
              <div className="text-center">
                <p className="text-lg font-semibold">Total Games Played</p>
                <p className="text-2xl">{totalGames}</p>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-lg bg-stone-800 p-6 shadow-md">
              <div className="text-center">
                <p className="text-lg font-semibold">Games won as White</p>
                <p className="text-2xl">{w}</p>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-lg bg-stone-800 p-6 shadow-md">
              <div className="text-center">
                <p className="text-lg font-semibold">Games won as Black</p>
                <p className="text-2xl">{b}</p>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-lg bg-stone-900 p-6 shadow-md">
              <div className="text-center">
                <p className="text-lg font-semibold">Win Percentage</p>
                <p className="text-2xl">{winPercentage}%</p>
              </div>
            </div>
          </div>
        </div>
        <table className="min-w-full divide-y divide-white">
          <thead className="bg-stone-900 text-white">
            <tr>
              <th className="px-6 py-3 text-center">Players</th>
              <th className="px-6 py-3 text-center">Result</th>
              <th className="px-6 py-3 text-center">Time Control</th>
              <th className="px-6 py-3 text-center">Date</th>
            </tr>
          </thead>
          <tbody className="bg-stone-800 divide-y divide-gray-400">
            {currentGames.map((game, index) => (
              <tr
                key={index}
                className="bg-stone-800 hover:bg-stone-600 transition-all"
              >
                <td className="px-6 py-4 whitespace-nowrap flex items-center justify-center">
                  <div className="mr-4">
                    <LightningBoltIcon height={15} width={15} color="yellow" />
                  </div>
                  <div className="flex items-center flex-col">
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 mr-2 bg-black"></div>
                      <p className="text-sm">{game.blackPlayer.name}</p>
                    </div>
                    <div className="flex items-center justify-center mt-1">
                      <div className="w-4 h-4 mr-2 bg-white"></div>
                      <p className="text-sm">{game.whitePlayer.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <p className="text-sm">{formatResult(game.result)}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <p className="text-sm">{game.timeControl}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <p className="text-sm">{formatDate(game.startAt)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        {Array.from(
          { length: Math.ceil(games.length / gamesPerPage) },
          (_, i) => (
            <button
              key={i}
              className={`mx-1 px-3 py-1 rounded-md ${
                currentPage === i + 1
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-600 text-white'
              }`}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default GameSettings;
