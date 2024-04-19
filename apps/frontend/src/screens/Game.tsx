/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket";
import { Chess } from 'chess.js'
import { useNavigate, useParams } from "react-router-dom";
import { INIT_GAME, MOVE, GAME_OVER } from '../../../shared';


interface Metadata {
    blackPlayer: string;
    whitePlayer: string;
}

export const Game = () => {
    const socket = useSocket();
    const { gameId } = useParams();

    const navigate = useNavigate();
    // Todo move to store/context
    const [chess, _setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false)
    const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null)
    const [result, setResult] = useState<"WHITE_WINS" | "BLACK_WINS" | "DRAW">(false);

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
                    chess.move(move);
                    setBoard(chess.board());
                    break;
                case GAME_OVER:
                    setResult(message.payload.result);
                    break;
            }
        }
    }, [chess, socket]);

    if (!socket) return <div>Connecting...</div>

    return <div className="">
        <div className="justify-center flex pt-4 text-white">
            {gameMetadata?.blackPlayer} vs {gameMetadata?.whitePlayer}
        </div>
        {result && <div className="justify-center flex pt-4 text-white">
            {result}    
        </div>}
        <div className="justify-center flex">
            <div className="pt-8 max-w-screen-lg w-full">
                <div className="grid grid-cols-6 gap-4 w-full">
                    <div className="col-span-4 w-full flex justify-center">
                        <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} />
                    </div>
                    <div className="col-span-2 bg-slate-900 w-full flex justify-center">
                        <div className="pt-8">
                            {!started && gameId === "random" && <Button onClick={() => {
                                socket.send(JSON.stringify({
                                    type: INIT_GAME
                                }))
                            }} >
                                Play
                            </Button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}