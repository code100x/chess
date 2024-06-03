import { Chess, Square } from 'chess.js';
import { useEffect, useState } from 'react';
import LetterNotation from './chess-board/LetterNotation';
import ChessSquare from './chess-board/ChessSquare';
import NumberNotation from './chess-board/NumberNotation';
import useWindowSize from '../hooks/useWindowSize';
import Confetti from 'react-confetti';
import { IMove } from '../screens/Review';

export const ReviewChessBoard = ({
  moves,
  activeMove,
}: {
  moves: IMove[];
  activeMove: number;
}) => {
  const { height, width } = useWindowSize();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const OFFSET = 100;
  const boxSize =
    width > height
      ? Math.floor((height - OFFSET) / 8)
      : Math.floor((width - OFFSET) / 8);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const chessCopy = new Chess();
    const newBoard = chessCopy.board();
    moves.slice(0, activeMove).forEach((move) => {
      const { from, to } = move;
      const [fromX, fromY] = [from.charCodeAt(0) - 97, 8 - parseInt(from[1])];
      const [toX, toY] = [to.charCodeAt(0) - 97, 8 - parseInt(to[1])];
      const piece = chessCopy.get(from);
      if (piece) {
        newBoard[fromY][fromX] = null;
        newBoard[toY][toX] = {
          square: to,
          type: piece.type,
          color: piece.color,
        };
        chessCopy.move(move);
      }
    });
    setChess(chessCopy);
    setBoard(newBoard);
  }, [activeMove]);

  return (
    <>
      {gameOver && <Confetti />}
      <div className="flex relative">
        <div className="text-white-200 mr-10 rounded-md overflow-hidden">
          {board.map((row, i) => {
            return (
              <div key={i} className="flex relative">
                <NumberNotation
                  isMainBoxColor={i % 2 === 0}
                  label={i.toString()}
                />
                {row.map((square, j) => {
                  j = j % 8;

                  const isMainBoxColor = (i + j) % 2 !== 0;
                  return (
                    <div
                      style={{
                        width: boxSize,
                        height: boxSize,
                      }}
                      key={j}
                      className={`${isMainBoxColor ? 'bg-[#739552]' : 'bg-[#EBEDD0]'} ${''}`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <div className="w-full justify-center flex h-full relative">
                        {square && <ChessSquare square={square} />}
                        {i === 1 && (
                          <LetterNotation
                            label={labels[j]}
                            isMainBoxColor={j % 2 !== 0}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <canvas
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
    </>
  );
};
