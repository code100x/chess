import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { MOVE } from "../screens/Game";
import ChessBoardImg from '../assets/Chess_Board.svg'

export const ChessBoard = ({ chess, board, socket, setBoard }: {
    chess: Chess;
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
    const [boardSize, setBoardSize] = useState(0)
    const boardRef = useRef<HTMLImageElement>(null);

    useEffect(()=>{
        console.log(boardSize)
    },[boardSize])

    useEffect(()=>{
        setBoardSize(boardRef.current?.getBoundingClientRect().width || 0)
        window.addEventListener('resize', ()=>{
            setBoardSize(boardRef.current?.getBoundingClientRect().width || 0)
        })  
    }, [])


    return <div className="text-white-200 flex justify-center items-center h-[95vh] overflow-hidden">
        {/* {board.map((row, i) => {
            return <div key={i} className="flex">
                {row.map((square, j) => {
                    const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;

                    return <div onClick={() => {
                        if (!from) {
                            setFrom(squareRepresentation);
                        } else {
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
                            chess.move({
                                from,
                                to: squareRepresentation
                            });
                            setBoard(chess.board());
                            console.log({
                                from,
                                to: squareRepresentation
                            })
                        }
                    }} key={j} className={`w-16 h-16 ${(i+j)%2 === 0 ? 'bg-green-500' : 'bg-slate-500'}`}>
                        <div className="w-full justify-center flex h-full">
                            <div className="h-full justify-center flex flex-col">
                                {square ? <img className="w-4" src={`/${square?.color === "b" ? b${square?.type}.svg : `w${square?.type}`}.svg`} /> : null} 
                            </div>
                        </div>
                    </div>
                })}
            </div>
        })} */}
        {
            <div className="relative w-[45vw]">
                <img className="w-[100%] h-[100%] touch-none" src={ChessBoardImg} ref={boardRef} />
               {
                     board.map((row, i) => {
                          return <div key={i} className="flex"
                        //   style={{
                        //     top: `${i*6.25}%`
                        //   }}
                          >
                            {row.map((square, j) => {
                                 const squareRepresentation = String.fromCharCode(97 + (j % 8)) + "" + (8 - i) as Square;
                                 const isWhite = (i+j)%2 === 0;
                                 return <div onClick={() => {
                                      if (!from) {
                                        setFrom(squareRepresentation);
                                      } else {
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
                                        console.log({
                                            from,
                                            to: squareRepresentation
                                       })
                                        chess.move({
                                             from,
                                             to: squareRepresentation
                                        });
                                        setBoard(chess.board());
                                      }
                                 }} key={j} className={`absolute`}
                                 style={{
                                    top: `${i*(boardSize/8)}px`,
                                    left: `${j*(boardSize/8)}px`,
                                    width: `${boardSize/8}px`,
                                    height: `${boardSize/8}px`,
                                 }}
                                 
                                 >
                                      <div className="w-full justify-center flex h-full">
                                        <div className="h-full justify-center flex flex-col">
                                             {square ? <img className="w-4" style={{scale:`${boardSize*3/480}`}} src={`/${square?.color === "b" ? `b${square?.type}` : `w${square?.type}`}.png`} /> : null} 
                                        </div>
                                      </div>
                                 </div>
                            })}
                          </div>
                     })
               }
            </div>
        }
    </div>
}