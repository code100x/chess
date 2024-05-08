/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import MoveSound from '/move.wav';
import { Button } from '../components/Button';
import { ChessBoard, isPromoting } from '../components/ChessBoard';
import { useSocket } from '../hooks/useSocket';
import { Chess, Move } from 'chess.js';
import { useNavigate, useParams } from 'react-router-dom';
import MovesTable from '../components/MovesTable';
import { useUser } from '@repo/store/useUser';
import { UserAvatar } from '../components/UserAvatar';
import {
  ANSWER,
  GAME_ADDED,
  GAME_ENDED,
  GAME_JOINED,
  GAME_OVER,
  GAME_TIME,
  ICE_CANDIDATE,
  INIT_GAME,
  JOIN_ROOM,
  MOVE,
  OFFER,
  SEND_OFFER,
  USER_TIMEOUT,
} from '@repo/common/messages';

export enum Result {
  WHITE_WINS = 'WHITE_WINS',
  BLACK_WINS = 'BLACK_WINS',
  DRAW = 'DRAW',
}
export interface GameResult {
  result: Result;
  by: string;
}

const GAME_TIME_MS = 10 * 60 * 1000;

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { movesAtom, userSelectedMoveIndexAtom } from '@repo/store/chessBoard';
import GameEndModal from '../components/GameEndModal';
import Draggable from 'react-draggable';
import { VideoCall } from '../components/VideoCall';

const moveAudio = new Audio(MoveSound);

interface Metadata {
  blackPlayer: { id: string; name: string };
  whitePlayer: { id: string; name: string };
}

export const Game = () => {
  const socket = useSocket();
  const { gameId } = useParams();
  const user = useUser();

  const navigate = useNavigate();
  // Todo move to store/context
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [added, setAdded] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [_senderPc, setSenderPc] = useState<RTCPeerConnection>();
  const [_receiverPc, setReceiverPc] = useState<RTCPeerConnection>();
  const [_localAudioTracks, setLocalAudioTracks] =
    useState<MediaStreamTrack | null>(null);
  const [_localVideoTracks, setLocalVideoTracks] =
    useState<MediaStreamTrack | null>(null);

  const setMoves = useSetRecoilState(movesAtom);
  const userSelectedMoveIndex = useRecoilValue(userSelectedMoveIndexAtom);
  const userSelectedMoveIndexRef = useRef(userSelectedMoveIndex);

  useEffect(() => {
    userSelectedMoveIndexRef.current = userSelectedMoveIndex;
  }, [userSelectedMoveIndex]);

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = async function (event) {
      const message = JSON.parse(event.data);
      const payload = message.payload;

      switch (message.type) {
        case GAME_ADDED:
          setAdded(true);
          break;
        case INIT_GAME:
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
          if (userSelectedMoveIndexRef.current !== null) {
            setMoves((moves) => [...moves, move]);
            return;
          }
          try {
            if (isPromoting(chess, move.from, move.to)) {
              chess.move({
                from: move.from,
                to: move.to,
                promotion: 'q',
              });
            } else {
              chess.move({ from: move.from, to: move.to });
            }
            setMoves((moves) => [...moves, move]);
            moveAudio.play();
          } catch (error) {
            console.log('Error', error);
          }
          break;
        case GAME_OVER:
          setResult(message.payload.result);
          break;

        case GAME_ENDED:
          const wonBy =
            message.payload.status === 'COMPLETED'
              ? message.payload.result !== 'DRAW'
                ? 'CheckMate'
                : 'Draw'
              : 'Timeout';
          setResult({
            result: message.payload.result,
            by: wonBy,
          });
          chess.reset();
          setMoves(() => {
            message.payload.moves.map((curr_move: Move) => {
              chess.move(curr_move as Move);
            });
            return message.payload.moves;
          });
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });

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
          console.error(message.payload);
          setStarted(true);

          message.payload.moves.map((x: Move) => {
            if (isPromoting(chess, x.from, x.to)) {
              chess.move({ ...x, promotion: 'q' });
            } else {
              chess.move(x);
            }
          });
          setMoves(message.payload.moves);
          break;

        case GAME_TIME:
          setPlayer1TimeConsumed(message.payload.player1Time);
          setPlayer2TimeConsumed(message.payload.player2Time);
          break;

        case SEND_OFFER:
          console.log('sending offer');
          const pc1 = new RTCPeerConnection();

          pc1.onicecandidate = async (event) => {
            console.log('receiving ice candidate locally');
            if (event.candidate) {
              console.log('\nice-candidate sender:', event.candidate);
              socket.send(
                JSON.stringify({
                  type: ICE_CANDIDATE,
                  payload: {
                    senderSocketid: user.id,
                    candidate: event.candidate,
                    type: 'sender',
                    gameId: payload.gameId,
                  },
                }),
              );
            }
          };

          pc1.onnegotiationneeded = async () => {
            console.log('on negotiation neeeded, sending offer');
            const sdp = await pc1.createOffer();
            await pc1.setLocalDescription(sdp);
            socket.send(
              JSON.stringify({
                type: OFFER,
                payload: {
                  sdp,
                  gameId: payload.gameId,
                  senderSocketid: user.id,
                },
              }),
            );
          };

          const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          const videoTrack = stream.getVideoTracks()[0];
          const audioTrack = stream.getAudioTracks()[0];

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = new MediaStream([
              videoTrack,
              audioTrack,
            ]);

            localVideoRef.current.play();
            setLocalVideoTracks(videoTrack);
            setLocalAudioTracks(audioTrack);
          }

          pc1.addTrack(videoTrack);

          setSenderPc(pc1);
          break;

        case OFFER:
          const pc2 = new RTCPeerConnection();

          pc2.ontrack = (event) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = new MediaStream([event.track]);
              remoteVideoRef.current.play();
            }
          };

          pc2.onicecandidate = async (event) => {
            if (!event.candidate) {
              return;
            }

            console.log('on ice candidate receiving side');
            if (event.candidate) {
              socket.send(
                JSON.stringify({
                  type: ICE_CANDIDATE,
                  payload: {
                    candidate: event.candidate,
                    type: 'receiver',
                    gameId: payload.gameId,
                    senderSocketid: user.id,
                  },
                }),
              );
            }
          };

          await pc2.setRemoteDescription(payload.remoteSdp);
          const sdp = await pc2.createAnswer();
          await pc2.setLocalDescription(sdp);

          setReceiverPc(pc2);

          socket.send(
            JSON.stringify({
              type: ANSWER,
              payload: {
                gameId: payload.gameId,
                sdp,
                senderSocketid: user.id,
              },
            }),
          );
          break;

        case ANSWER:
          setSenderPc((pc) => {
            pc?.setRemoteDescription(payload.remoteSdp);
            return pc;
          });
          break;

        case ICE_CANDIDATE:
          if (payload.type === 'sender') {
            setReceiverPc((pc) => {
              pc?.addIceCandidate(payload.candidate);
              return pc;
            });
          } else {
            setSenderPc((pc) => {
              pc?.addIceCandidate(payload.candidate);
              return pc;
            });
          }
          break;

        default:
          console.log(message);
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

    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.remove();
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.remove();
        remoteVideoRef.current.srcObject = null;
      }
    };
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
  }, [started, gameMetadata, user]);

  const getTimer = (timeConsumed: number) => {
    const timeLeftMs = GAME_TIME_MS - timeConsumed;
    const minutes = Math.floor(timeLeftMs / (1000 * 60));
    const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

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
    <div className="relative overflow-x-hidden">
      {result && (
        <GameEndModal
          blackPlayer={gameMetadata?.blackPlayer}
          whitePlayer={gameMetadata?.whitePlayer}
          gameResult={result}
        ></GameEndModal>
      )}
      {started && (
        <div className="justify-center flex pt-4 text-white">
          {(user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') ===
          chess.turn()
            ? 'Your turn'
            : "Opponent's turn"}
        </div>
      )}
      <div className="items-start justify-center flex">
        <div className="pt-2 w-full">
          <div className="flex justify-around content-around w-full gap-6 max-xl:flex-wrap px-6">
            <div className="text-white">
              <div className="flex justify-center">
                <div>
                  <div className="mb-4">
                    {started && (
                      <div className="flex justify-between">
                        <UserAvatar
                          name={
                            user.id === gameMetadata?.whitePlayer?.id
                              ? gameMetadata?.blackPlayer?.name
                              : gameMetadata?.whitePlayer?.name ?? ''
                          }
                        />
                        {getTimer(
                          user.id === gameMetadata?.whitePlayer?.id
                            ? player2TimeConsumed
                            : player1TimeConsumed,
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`w-full flex justify-center text-white`}>
                      <ChessBoard
                        started={started}
                        gameId={gameId ?? ''}
                        myColor={
                          user.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w'
                        }
                        chess={chess}
                        setBoard={setBoard}
                        socket={socket}
                        board={board}
                      />
                    </div>
                  </div>
                  {started && (
                    <div className="mt-4 flex justify-between">
                      <UserAvatar
                        name={
                          user.id === gameMetadata?.blackPlayer?.id
                            ? gameMetadata?.blackPlayer?.name
                            : gameMetadata?.whitePlayer?.name ?? ''
                        }
                      />
                      {getTimer(
                        user.id === gameMetadata?.blackPlayer?.id
                          ? player2TimeConsumed
                          : player1TimeConsumed,
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-md max-h-[90vh] mt-10">
              {!started && (
                <div className="pt-8 flex justify-center w-full">
                  {added ? (
                    <div className="text-white">Waiting</div>
                  ) : (
                    gameId === 'random' && (
                      <Button
                        onClick={() => {
                          socket.send(
                            JSON.stringify({
                              type: INIT_GAME,
                            }),
                          );
                        }}
                      >
                        Play
                      </Button>
                    )
                  )}
                </div>
              )}
              <MovesTable started={started} />
            </div>
          </div>
        </div>
      </div>
      {started && (
        <Draggable bounds="parent">
          <div className="absolute top-0 right-10">
            <VideoCall
              localVideoRef={localVideoRef}
              remoteVideoRef={remoteVideoRef}
              setLocalAudioTracks={setLocalAudioTracks}
              setLocalVideoTracks={setLocalVideoTracks}
            />
          </div>
        </Draggable>
      )}
    </div>
  );
};
