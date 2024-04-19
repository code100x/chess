/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard, isPromoting } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket";
import { Chess, Square } from 'chess.js'
import { useNavigate, useParams } from "react-router-dom";
import MovesTable from "../components/MovesTable";
import { useUser } from "@repo/store/useUser";

// TODO: Move together, there's code repetition here
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const OPPONENT_DISCONNECTED = "opponent_disconnected";
export const GAME_OVER = "game_over";
export const JOIN_ROOM = "join_room";
export const GAME_JOINED = "game_joined"

export interface IMove {
    from: Square; to: Square
}

interface Metadata {
    blackPlayer: { id: string, name: string };
    whitePlayer: {id: string, name: string };
}

export const Game = () => {
    const socket = useSocket();
    const { gameId } = useParams();
    const user = useUser();

    const navigate = useNavigate();
    // Todo move to store/context
    const [chess, _setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false)
    const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null)
    const [result, setResult] = useState<"WHITE_WINS" | "BLACK_WINS" | "DRAW" | typeof OPPONENT_DISCONNECTED | null>(null);
    const [moves, setMoves] = useState<IMove[]>([]);

    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case INIT_GAME:
                    setBoard(chess.board());
                    setStarted(true)
                    navigate(`/game/${message.payload.gameId}`)
                    setGameMetadata({
                        blackPlayer: message.payload.blackPlayer,
                        whitePlayer: message.payload.whitePlayer
                    })
                    break;
                case MOVE:
                    const move = message.payload;
                    const moves = chess.moves({verbose: true});
                    //TODO: Fix later
                    if (moves.map(x => JSON.stringify(x)).includes(JSON.stringify(move))) return;
                    if (isPromoting(chess, move.from, move.to))  {
                        chess.move({
                            from: move.from,
                            to: move.to,
                            promotion: 'q'
                        });
                    } else {
                        chess.move(move);
                    }
                    setBoard(chess.board());
                    setMoves(moves => [...moves, move])
                    break;
                case GAME_OVER:
                    setResult(message.payload.result);
                    break;

                case OPPONENT_DISCONNECTED:
                    setResult(OPPONENT_DISCONNECTED)
                    break;

                case GAME_JOINED:
                    setGameMetadata({
                        blackPlayer: message.payload.blackPlayer,
                        whitePlayer: message.payload.whitePlayer
                    })
                    setStarted(true)
                    setMoves(message.payload.moves);
                    message.payload.moves.map(x => {
                        if (isPromoting(chess, x.from, x.to)) {
                            chess.move({...x,  promotion: 'q' })
                        } else {
                            chess.move(x)
                        }
                    })
                    setBoard(chess.board());
                    break;
            }
        }

        if (gameId !== "random") {
            socket.send(JSON.stringify({
                type: JOIN_ROOM, 
                payload: {
                    gameId
                }
            }))
        }
    }, [chess, socket]);

    if (!socket) return <div>Connecting...</div>

    return <div className="">
        <div className="justify-center flex pt-4 text-white">
            {gameMetadata?.blackPlayer?.name} vs {gameMetadata?.whitePlayer?.name}
        </div>
        {result && <div className="justify-center flex pt-4 text-white">
            {result}    
        </div>}
        <div className="justify-center flex">
            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-4 w-full">
                    <div className="col-span-4 w-full flex justify-center text-white">
                        <ChessBoard started={started} gameId={gameId ?? ""} myColor={user.id === gameMetadata?.blackPlayer?.id ? "b" : "w"} setMoves={setMoves} moves={moves} chess={chess} setBoard={setBoard} socket={socket} board={board} />
                    </div>
                    <div className="col-span-2 bg-slate-900 w-full flex justify-center h-[70vh] max-h-[40rem] overflow-y-auto">
                        {!started && gameId === "random" && 
                        <div className="pt-8"> 
                            <Button onClick={() => {
                            socket.send(JSON.stringify({
                                type: INIT_GAME
                            }))
                            }} >
                            Play
                            </Button>
                        </div>
                        }
                        <div>            
                            {moves.length > 0 && <div className="mt-4"><MovesTable moves={moves} /></div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}