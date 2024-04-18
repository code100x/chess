import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({
  chess,
  board,
  socket,
  setBoard,
}: {
  chess: Chess;
  setBoard: React.Dispatch<
    React.SetStateAction<
      ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    >
  >;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
}) => {

  const [from, setFrom] = useState<null | Square>(null);

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    e.dataTransfer.setData("text/plain", square);
    setFrom(square);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, to: Square) => {
    e.preventDefault();
    if (from) {
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            move: {
              from,
              to,
            },
          },
        })
      );

      chess.move({
        from,
        to,
      });
      setBoard(chess.board());
      setFrom(null);
      setvalidSquares([])

    }
  };

  //   VALID MOVES LOGIC HERE
  const [validSquares, setvalidSquares] = useState<[number, number][]>([])

  const validMoves = (square: Square | null) => {
    const moves = chess.moves({ square: square! })

    const algebraicToIndices = (square: string): [number, number] => {
      let file: number, rank: number;
      if (square.length === 2) {
        file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        rank = 8 - parseInt(square.substring(1));
      } else if (square.length === 3) {
        file = square.charCodeAt(1) - 'a'.charCodeAt(0);
        rank = 8 - parseInt(square.substring(2));
      } else {
        throw new Error('Invalid square notation');
      }
      return [rank, file];
    };

    const moveIndices = moves.map(move => algebraicToIndices(move));
    setvalidSquares(moveIndices)
  }

  return (
    <div className="text-white-200">
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {
              const squareRepresentation = (String.fromCharCode(97 + (j % 8)) +
                "" +
                (8 - i)) as Square;

              return (
                <div
                  key={j}
                  className={`w-16 h-16 ${(i + j) % 2 === 0 ? "bg-green-500" : "bg-slate-500"
                    }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, squareRepresentation)}
                >
                  <div className="w-full justify-center flex items-center h-full">
                    {validSquares.length > 0 ? <div className={`${validSquares.some(square => square[0] === i && square[1] === j) ? "bg-yellow-200 absolute p-2 flex justify-center items-center  h-2 w-2 rounded-[50%] " : ""}`}> </div> : null}
                    <div onClick={() => validMoves(square && square.square)} className="h-full justify-center flex flex-col">
                      {square ? (
                        <img
                          className="w-4"
                          src={`/${square?.color === "b"
                            ? square?.type
                            : `${square?.type?.toUpperCase()} copy`
                            }.png`}
                          draggable={true}
                          onDragStart={(e) =>
                            handleDragStart(e, squareRepresentation)
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
