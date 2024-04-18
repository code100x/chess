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
  const [draggedPiece, setDraggedPiece] = useState<Square | null>(null);

  const handleDragStart = (
    event: React.DragEvent<HTMLImageElement>,
    square: Square
  ) => {
    event.dataTransfer.setData("text/plain", square);
    setDraggedPiece(square);
  };

  const handleDragEnter = (
    event: React.DragEvent<HTMLDivElement>,
    square: Square
  ) => {
    event.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    square: Square
  ) => {
    event.preventDefault();
    if (draggedPiece && square) {
      try {
        const move = chess.move({
          from: draggedPiece,
          to: square,
          //   verbose: true,
        });

        if (move) {
          socket.send(
            JSON.stringify({
              type: MOVE,
              payload: {
                move: {
                  from: draggedPiece,
                  to: square,
                },
              },
            })
          );

          setBoard(chess.board());
          console.log({
            from: draggedPiece,
            to: square,
          });
        }
      } catch (error) {
        alert("Invalid move");
        // console.error("Invalid move:", error.message);
      }
    }
    setDraggedPiece(null);
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
                  onDragEnter={(e) => handleDragEnter(e, squareRepresentation)}
                  onDrop={(e) => handleDrop(e, squareRepresentation)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
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
                          draggable
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
