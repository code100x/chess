/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import MoveSound from '../../public/move.wav';
import { Button } from '../components/Button';
import { ChessBoard, isPromoting } from '../components/ChessBoard';
import { useSocket } from '../hooks/useSocket';
import { Chess, Move, Square } from 'chess.js';
import { useNavigate, useParams } from 'react-router-dom';
import MovesTable from '../components/MovesTable';
import { UserAvatar } from '../components/UserAvatar';

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
  startTime: number;
  endTime: number;
}

const moveAudio = new Audio(MoveSound);

interface Metadata {
  blackPlayer: { id: string; name: string };
  whitePlayer: { id: string; name: string };
}

export const Spectate = () => {
  const socket = useSocket();
  const { gameId } = useParams();

  const navigate = useNavigate();
  // Todo move to store/context
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [added, setAdded] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [result, setResult] = useState<
    | 'WHITE_WINS'
    | 'BLACK_WINS'
    | 'DRAW'
    | typeof OPPONENT_DISCONNECTED
    | typeof USER_TIMEOUT
    | null
  >(null);
  const [moves, setMoves] = useState<IMove[]>([]);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  const [myMoveStartTime, setMyMoveStartTime] = useState(0);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case GAME_ADDED:
          setAdded(true);
          break;
        case INIT_GAME:
          setMyMoveStartTime(message.payload.startTime);
          setBoard(chess.board());
          setStarted(true);
          navigate(`/game/${message.payload.gameId}`);
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });
          break;
        case MOVE:
          const { move, player1TimeConsumed, player2TimeConsumed } =
            message.payload;
          setPlayer1TimeConsumed(player1TimeConsumed);
          setPlayer2TimeConsumed(player2TimeConsumed);
          const moves = chess.moves({ verbose: true });
          //TODO: Fix later
          if (
            moves.map((x) => JSON.stringify(x)).includes(JSON.stringify(move))
          ) {
            return;
          }
          if (isPromoting(chess, move.from, move.to)) {
            chess.move({
              from: move.from,
              to: move.to,
              promotion: 'q',
            });
          } else {
            chess.move({ from: move.from, to: move.to });
          }
          moveAudio.play();
          setBoard(chess.board());
          const piece = chess.get(move.to)?.type;
          setMoves((moves) => [
            ...moves,
            {
              from: move.from,
              to: move.to,
              piece,
              startTime: move.startTime,
              endTime: move.endTime,
            },
          ]);
          // if (move.player2UserId === user.id) {
          //   setMyTimer(move.player2Time);
          //   setOppotentTimer(move.player1Time);
          // } else {
          //   setMyTimer(move.player1Time);
          //   setOppotentTimer(move.player2Time);
          // }
          break;
        case GAME_OVER:
          setResult(message.payload.result);
          break;

        case OPPONENT_DISCONNECTED:
          setResult(OPPONENT_DISCONNECTED);
          break;

        case USER_TIMEOUT:
          setResult(message.payload.win);
          break;

        case GAME_JOINED:
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });
          setPlayer1TimeConsumed(message.payload.player1TimeConsumed);
          setPlayer2TimeConsumed(message.payload.player2TimeConsumed);
          setStarted(true);
          setMoves(message.payload.moves);
          message.payload.moves.map((x: Move) => {
            if (isPromoting(chess, x.from, x.to)) {
              chess.move({ ...x, promotion: 'q' });
            } else {
              chess.move(x);
            }
          });
          setBoard(chess.board());
          break;

        default:
          alert(message.payload.message);
          break;
      }
    };

    if (gameId !== 'random') {
      socket.send(
        JSON.stringify({
          type: JOIN_ROOM,
          payload: {
            gameId,
          },
        }),
      );
    }
  }, [chess, socket]);

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        if (chess.turn() === 'w') {
          setPlayer1TimeConsumed((p) => p + 100);
        } else {
          setPlayer2TimeConsumed((p) => p + 100);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [started, gameMetadata]);

  const getTimer = (tempTime: number) => {
    const minutes = Math.floor(tempTime / (1000 * 60));
    const remainingSeconds = Math.floor((tempTime % (1000 * 60)) / 1000);

    return (
      <div className="text-white">
        Time Left: {minutes < 10 ? '0' : ''}
        {minutes}:{remainingSeconds < 10 ? '0' : ''}
        {remainingSeconds}
      </div>
    );
  };

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="">
      {result && (
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
      )}
      <div className="justify-center flex">
        <div className="pt-2 w-full">
          <div className="grid grid-cols-7 gap-4 w-full">
            <div className="col-span-7 lg:col-span-5 w-full text-white">
              <div className="flex justify-center">
                <div>
                  <div className="mb-4">
                    {started && (
                      <div className="flex justify-between">
                        <UserAvatar
                          name={gameMetadata?.blackPlayer?.name ?? ''}
                        />
                        {getTimer(player2TimeConsumed)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className={`col-span-4 w-full flex justify-center text-white pointer-events-none`}
                    >
                      <ChessBoard
                        started={started}
                        gameId={gameId ?? ''}
                        myColor={'w'}
                        // setMoves={setMoves}
                        // moves={moves}
                        chess={chess}
                        setBoard={setBoard}
                        socket={socket}
                        board={board}
                        myMoveStartTime={myMoveStartTime}
                        setMyMoveStartTime={setMyMoveStartTime}
                      />
                    </div>
                  </div>
                  {started && (
                    <div className="mt-4 flex justify-between">
                      <UserAvatar
                        name={gameMetadata?.whitePlayer?.name ?? ''}
                      />
                      {getTimer(player1TimeConsumed)}
                    </div>
                  )}
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
