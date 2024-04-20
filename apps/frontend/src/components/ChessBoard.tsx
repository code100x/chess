import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { IMove, MOVE, } from "../screens/Game";
import { GoDotFill } from "react-icons/go";

export function isPromoting(chess: Chess, from: Square, to: Square) {
    if (!from) {
        return false;
    }

    const piece = chess.get(from);
  
    if (piece?.type !== "p") {
      return false;
    }
  
    if (piece.color !== chess.turn()) {
      return false;
    }
  
    if (!["1", "8"].some((it) => to.endsWith(it))) {
      return false;
    }
  
    return chess
      .moves({ square: from, verbose: true })
      .map((it) => it.to)
      .includes(to);
}

export const ChessBoard = ({ gameId, started, myColor, chess, board, socket, setBoard, moves, setMoves }: {
    myColor: Color, 
    gameId: string,
    started: boolean,
    chess: Chess;
    moves: IMove[];
    setMoves: React.Dispatch<React.SetStateAction<IMove[]>>;
    setBoard: React.Dispatch<React.SetStateAction<({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][]>>;
    board: ({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket: WebSocket;
}) => {
    const [from, setFrom] = useState<null | Square>(null);
    const isMyTurn = myColor === chess.turn();
    const [legalMoves, setLegalMoves] = useState<string[]>([]);
    const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    return (
        <div className="flex">
            <div className="text-white-200 mr-10">
            <div className={`${myColor === "b" ? "rotate-180" : ""}`}>
            {board.map((row, i) => {
                return <div key={i} className={`flex ${myColor === "b" ? "flex-row-reverse" : ""}`}>
                            <div className={`w-16 h-16 flex justify-center items-center text-cyan-100 ${myColor === "b" && "rotate-180"}`}>
                                {8 - i} {/* Vertical labels */}
                            </div>  
                    {row.map((square, j) => {
                        const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;

                        return <div onClick={() => {
                            if (!started) {
                                return;
                            }
                            if (!from && square?.color !== chess.turn()) return;
                            if (!isMyTurn) return;
                            if (from === squareRepresentation) {
                                setFrom(null);
                            }
                            
                            if (!from) {
                                setFrom(squareRepresentation);
                                setLegalMoves(chess.moves({ square: squareRepresentation }))
                        } else {
                                try {
                                    if (isPromoting(chess, from ,squareRepresentation))  {
                                        chess.move({
                                            from,
                                            to: squareRepresentation,
                                            promotion: 'q'
                                        });
                                    } else {
                                        chess.move({
                                            from,
                                            to: squareRepresentation,
                                        });
                                    }
                                    socket.send(JSON.stringify({
                                        type: MOVE,
                                        payload: {
                                            gameId,
                                            move: {
                                                from,
                                                to: squareRepresentation
                                            }
                                        }
                                    }))
                                    setFrom(null)
                                    setLegalMoves([])
                                    setBoard(chess.board());
                                    console.log({
                                        from,
                                        to: squareRepresentation
                                    })
                                    setMoves(moves =>[...moves, { from, to: squareRepresentation }]);
                                } catch(e) {

                                }
                            }
                        }} key={j} className={`w-16 h-16 relative ${(i+j)%2 === 0 ? 'bg-green-500' : 'bg-slate-500'}`}>
                            <div className="w-full justify-center flex h-full">
                                <div className={`h-full justify-center flex flex-col ${myColor === "b" ? "rotate-180" : ""}`}>
                                    {square ? <img className="w-4" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`} /> : null} 
                                </div>
                            </div>
                            {includeBox(legalMoves, j, i) && <div className="absolute opacity-100 z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><GoDotFill size={"2rem"} color="#476566"/></div>}
                        </div>
                    })}
                </div>
            })}
            </div>
            <div className={`flex ${myColor === "b" ? "flex-row" : ""}`}>
                    <div className="w-16 h-8"></div> 
                        {labels.map((label, i) => (
                            <div key={i} className="w-16 h-8 flex justify-center items-center text-cyan-100">
                                {label} {/* Horizontal labels */}
                            </div>
                        ))}
                    {/* {myColor === "w" ? <div className="w-16 h-8"></div> : "" } */}
                    </div>
            </div>
        </div>
   
    )
}

const includeBox = (legalMoves: string[], i:number,j:number) => {
    let first;
    const letters: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    if (i >= 0 && i < letters.length) {
        first = letters[i];
    }
    return legalMoves.includes(first! + (8-j!))
}

