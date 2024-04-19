import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { IMove, MOVE, } from "../screens/Game";


export const ChessBoard = ({ myColor, chess, board, socket, setBoard, moves, setMoves }: {
    myColor: Color, 
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

    return (
        <div className="flex">
            <div className="text-white-200 mr-10">
            {board.map((row, i) => {
                return <div key={i} className="flex">
                    {row.map((square, j) => {
                        const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;

                        return <div onClick={() => {
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
                                    chess.move({
                                        from,
                                        to: squareRepresentation
                                    });
                                    socket.send(JSON.stringify({
                                        type: MOVE,
                                        payload: {
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
                        }} key={j} className={`w-16 h-16 ${includeBox(legalMoves,j,i) ? `${(i+j)%2 === 0 ? 'bg-green_legal' : 'bg-slate_legal'}` : `${(i+j)%2 === 0 ? 'bg-green-500' : 'bg-slate-500'}`}`}>
                            {from}
                            <div className="w-full justify-center flex h-full">
                                <div className="h-full justify-center flex flex-col">
                                    {square ? <img className="w-4" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`} /> : null} 

                                </div>
                            </div>
                        </div>
                    })}
                </div>
            })}
        </div>
    </div>
    )
}

const includeBox = (legalMoves: string[], i:number,j:number) => {
    let first,second

    switch (i) {
        case 0:
            first = 'a'
            break;
        case 1:
            first = 'b'
            break;
        case 2:
            first = 'c'
            break;
        case 3:
            first = 'd'
            break;
        case 4:
            first = 'e'
            break;
        case 5:
            first = 'f'
            break;
        case 6:
            first = 'g'
            break;
        case 7:
            first = 'h'
            break;
        default:
            break;
    }

    switch (j) {
        case 0:
            second = '8'
            break;
        case 1:
            second = '7'
            break;
        case 2:
            second = '6'
            break;
        case 3:
            second = '5'
            break;
        case 4:
            second = '4'
            break;
        case 5:
            second = '3'
            break;
        case 6:
            second = '2'
            break;
        case 7:
            second = '1'
            break;
        default:
            break;
    }

    return legalMoves.includes(first! + second!)
}

