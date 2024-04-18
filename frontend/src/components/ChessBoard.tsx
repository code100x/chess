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
    }
  };

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
                  className={`w-16 h-16 ${
                    (i + j) % 2 === 0 ? "bg-green-500" : "bg-slate-500"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, squareRepresentation)}
                >
                  <div className="w-full justify-center flex h-full">
                    <div className="h-full justify-center flex flex-col">
                      {square ? (
                        <img
                          className="w-4"
                          src={`/${
                            square?.color === "b"
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
