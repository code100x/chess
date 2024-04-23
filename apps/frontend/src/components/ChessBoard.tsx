import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { MouseEvent, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from '../hooks/useWindowSize';
import { IMove } from '../screens/Game';
import { drawArrow } from '../utils/canvas';
import NumberNotation from './chess-board/NumberNotation';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ChessSquare from './chess-board/ChessSquare';

export const ChessBoard = ({
  gameId,
  started,
  myColor,
  chess,
  board,
  socket,
  setBoard,
  setMoves,
  moves,
}: {
  myColor: Color;
  gameId: string;
  started: boolean;
  chess: Chess;
  moves: IMove[];
  setMoves: React.Dispatch<React.SetStateAction<IMove[]>>;
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
  const { height, width } = useWindowSize();
  const [lastMoveFrom, lastMoveTo] = [
    moves?.at(-1)?.from || '',
    moves?.at(-1)?.to || '',
  ];
  const [rightClickedSquares, setRightClickedSquares] = useState<string[]>([]);
  const [arrowStart, setArrowStart] = useState<string | null>(null);

  const [from, setFrom] = useState<null | Square>(null);
  const isMyTurn = myColor === chess.turn();
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const isFlipped = myColor === 'b';
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const OFFSET = 100;
  const boxSize =
    width > height
      ? Math.floor((height - OFFSET) / 8)
      : Math.floor((width - OFFSET) / 8);
  const [gameOver, setGameOver] = useState(false);

  const handleMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    squareRep: string,
  ) => {
    if (e.button === 2) {
      setArrowStart(squareRep);
    }
  };

  const clearCanvas = () => {
    setRightClickedSquares([]);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleRightClick = (squareRep: string) => {
    if (rightClickedSquares.includes(squareRep)) {
      setRightClickedSquares((prev) => prev.filter((sq) => sq !== squareRep));
    } else {
      setRightClickedSquares((prev) => [...prev, squareRep]);
    }
  };

  const handleDrawArrow = (squareRep: string) => {
    if (arrowStart) {
      const stoppedAtSquare = squareRep;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawArrow(ctx, arrowStart, stoppedAtSquare, isFlipped);
        }
      }
      setArrowStart(null);
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>, squareRep: string) => {
    e.preventDefault();
    if (!started) {
      return;
    }
    if (e.button === 2) {
      if (arrowStart === squareRep) {
        handleRightClick(squareRep);
      } else {
        handleDrawArrow(squareRep);
      }
    } else {
      clearCanvas();
    }
  };

  useEffect(() => {
    clearCanvas();
  }, [moves]);

  return (
    <DndProvider backend={HTML5Backend}>
      {gameOver && <Confetti />}
      <div className="flex relative">
        <div className="text-white-200 mr-10 rounded-md overflow-hidden">
          {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
            i = isFlipped ? i + 1 : 8 - i;
            return (
              <div key={i} className="flex relative">
                <NumberNotation
                  isMainBoxColor={i % 2 === 0}
                  label={i.toString()}
                />
                {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
                  j = isFlipped ? 7 - (j % 8) : j % 8;

                  const isMainBoxColor = isFlipped
                    ? (i + j) % 2 === 0
                    : (i + j) % 2 !== 0;
                  const squareRepresentation = (String.fromCharCode(97 + j) +
                    '' +
                    i) as Square;
                  const isHighlightedSquare =
                    from === squareRepresentation ||
                    squareRepresentation === lastMoveFrom ||
                    squareRepresentation === lastMoveTo;
                  const isRightClickedSquare =
                    rightClickedSquares.includes(squareRepresentation);

                  return (
                    <ChessSquare
                      key={j}
                      i={i}
                      j={j}
                      boxSize={boxSize}
                      chess={chess}
                      from={from}
                      gameId={gameId}
                      handleMouseDown={handleMouseDown}
                      handleMouseUp={handleMouseUp}
                      isFlipped={isFlipped}
                      isHighlightedSquare={isHighlightedSquare}
                      isMainBoxColor={isMainBoxColor}
                      isRightClickedSquare={isRightClickedSquare}
                      legalMoves={legalMoves}
                      myColor={myColor}
                      setBoard={setBoard}
                      setFrom={setFrom}
                      setGameOver={setGameOver}
                      setLegalMoves={setLegalMoves}
                      setMoves={setMoves}
                      socket={socket}
                      square={square}
                      squareRepresentation={squareRepresentation}
                      started={started}
                      isMyTurn={isMyTurn}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        <canvas
          ref={(ref) => setCanvas(ref)}
          width={boxSize * 8}
          height={boxSize * 8}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
          onContextMenu={(e) => e.preventDefault()}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onMouseUp={(e) => e.preventDefault()}
        ></canvas>
      </div>
    </DndProvider>
  );
};
