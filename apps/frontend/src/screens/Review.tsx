/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import MoveSound from '../../public/move.wav';
import { Square } from 'chess.js';
import { useParams } from 'react-router-dom';
import MovesTable from '../components/MovesTable';
import { UserAvatar } from '../components/UserAvatar';
import { ReviewChessBoard } from '../components/ReviewChessBoard';

// TODO: Move together, there's code repetition here
export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const OPPONENT_DISCONNECTED = 'opponent_disconnected';
export const GAME_OVER = 'game_over';
export const JOIN_ROOM = 'join_room';
export const GAME_JOINED = 'game_joined';
export const GAME_ALERT = 'game_alert';
export const GAME_ADDED = 'game_added';
export const USER_TIMEOUT = 'user_timeout';

const GAME_TIME_MS = 10 * 60 * 1000;

export interface IMove {
  from: Square;
  to: Square;
  piece: string;
}

const moveAudio = new Audio(MoveSound);

interface Player {
  id: string;
  name: string;
}

export const Review = () => {
  const { gameId } = useParams();

  // Todo move to store/context
  const [whitePlayer, setWhitePlayer] = useState<Player | null>(null);
  const [blackPlayer, setBlackPlayer] = useState<Player | null>(null);
  const [moves, setMoves] = useState<IMove[]>([]);
  const [activeMove, setActiveMove] = useState<number>(0);

  useEffect(() => {
    const onLoad = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL}/v1/games/${gameId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          // setGames(data);
          setWhitePlayer({
            id: data.whitePlayer.id,
            name: data.whitePlayer.name,
          });
          setBlackPlayer({
            id: data.blackPlayer.id,
            name: data.blackPlayer.name,
          });
          data.moves.forEach((move: IMove) => {
            setMoves((prevMoves) => [
              ...prevMoves,
              {
                from: move.from,
                to: move.to,
                piece: move.piece,
              },
            ]);
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    onLoad();
  }, [gameId]);

  return (
    <div className="">
      {/* {result && (
        <div className="justify-center flex pt-4 text-white">
          {result === 'WHITE_WINS' && 'White wins'}
          {result === 'BLACK_WINS' && 'Black wins'}
          {result === 'DRAW' && 'Draw'}
        </div>
      )}
      {started && (
        <div className="justify-center flex pt-4 text-white">
          {moves.length % 2 === 0 ? 'White to move' : 'Black to move'}
        </div>
      )} */}
      <div className="justify-center flex">
        <div className="pt-2 w-full">
          <div className="grid grid-cols-7 gap-4 w-full">
            <div className="col-span-7 lg:col-span-5 w-full text-white">
              <div className="flex justify-center">
                <div>
                  <div className="mb-4">
                    {
                      <div className="flex justify-between">
                        <UserAvatar name={blackPlayer?.name ?? ''} />
                      </div>
                    }
                  </div>
                  <div>
                    <div
                      className={`col-span-4 w-full flex justify-center text-white pointer-events-none`}
                    >
                      <ReviewChessBoard moves={moves} activeMove={activeMove} />
                    </div>
                  </div>
                  {
                    <div className="mt-3 flex justify-between">
                      <UserAvatar name={whitePlayer?.name ?? ''} />
                      <div className="text-white flex gap-3 text-3xl mr-10 font-bold">
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            if (activeMove > 0) {
                              setActiveMove(activeMove - 1);
                            }
                          }}
                        >
                          {'<'}
                        </span>
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            if (activeMove < moves.length) {
                              setActiveMove(activeMove + 1);
                            }
                          }}
                        >
                          {'>'}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
            <div className="col-span-2 bg-brown-500 w-full flex justify-center h-[90vh] overflow-scroll mt-10 overflow-y-scroll no-scrollbar">
              <div>
                {moves.length > 0 && (
                  <div className="mt-4">
                    <MovesTable />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
