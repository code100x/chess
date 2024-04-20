import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { IMove, MOVE } from "../screens/Game";
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

export const ChessBoard = ({ gameId, started, myColor, chess, board, socket, setBoard, setMoves }: {
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
            {(myColor==="b"?[...board].reverse():board).map((row, i) => {
                return <div key={i} className="flex">
                            <div className="w-16 h-16 flex justify-center items-center text-cyan-100">
                                {myColor==='b'?i+1:8-i} {/* Vertical labels */}
                            </div>  
                    {(myColor==='b'?[...row].reverse():row).map((square, j) => {
                       const squareRepresentation = String.fromCharCode(97 + (myColor === 'b' ? 7 - j % 8 : j % 8)) + "" + (myColor==='b'? i+1:8-i) as Square;

                        return <div onClick={() => {
                            if (!started) {
                                return;
                            }
                            if (!from && square?.color !== chess.turn()) return;
                            if (!isMyTurn) return;
                            if (from === squareRepresentation) {
                                setFrom(null);
                                setLegalMoves([]);
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
                                <div className="h-full justify-center flex flex-col">
                                    {square ? <img className="w-4" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`} /> : null} 
                                </div>
                            </div>
                            {includeBox(legalMoves, j, i,myColor) && <div className="absolute opacity-100 z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"><GoDotFill size={"2rem"} color="#476566"/></div>}
                        </div>
                    })}
                </div>
            })}
             <div className="flex">
                    <div className="w-16 h-8"></div> 
                        {(myColor==='b'?[...labels].reverse():labels).map((label, i) => (
                            <div key={i} className="w-16 h-8 flex justify-center items-center text-cyan-100">
                                {label} {/* Horizontal labels */}
                            </div>
                        ))}
                    </div>
            </div>
        </div>
   
    )
}

const includeBox = (legalMoves: string[], i:number,j:number,myColor:Color) => {
    let first;
    let second;
    const letters: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    {myColor==='b'?letters.reverse():letters}
    {myColor==='b'?second=j+1:second=8-j}

    if (i >= 0 && i < letters.length) {
        first = letters[i];
    }
    return legalMoves.includes(first! + second)
}

