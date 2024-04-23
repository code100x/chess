import { isPromoting } from '../../utils/isPromoting';
import MoveSound from '/move.wav';
import CaptureSound from '/capture.wav';
import LetterNotation from './LetterNotation';
import Piece from './Piece';
import LegalMoveIndicator from './LegalMoveIndicator';
import { IMove, MOVE } from '../../screens/Game';
import { useDrop } from 'react-dnd';
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { MouseEvent } from 'react';

const moveAudio = new Audio(MoveSound);
const captureAudio = new Audio(CaptureSound);

const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

interface ChessSquareProps {
  i: number;
  j: number;
  boxSize: number;
  chess: Chess;
  from: Square | null;
  gameId: string;
  handleMouseDown: (e: MouseEvent<HTMLDivElement>, squareRep: string) => void;
  handleMouseUp: (e: MouseEvent<HTMLDivElement>, squareRep: string) => void;
  isFlipped: boolean;
  isHighlightedSquare: boolean;
  isMainBoxColor: boolean;
  isRightClickedSquare: boolean;
  legalMoves: string[];
  setBoard: React.Dispatch<
    React.SetStateAction<
      ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    >
  >;
  setFrom: React.Dispatch<React.SetStateAction<null | Square>>;
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  setLegalMoves: React.Dispatch<React.SetStateAction<string[]>>;
  setMoves: React.Dispatch<React.SetStateAction<IMove[]>>;
  socket: WebSocket;
  square: {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null;
  squareRepresentation: Square;
  started: boolean;
  isMyTurn: boolean;
  myColor: string;
}

const ChessSquare = ({
  i,
  j,
  boxSize,
  chess,
  from,
  gameId,
  handleMouseDown,
  handleMouseUp,
  isFlipped,
  isHighlightedSquare,
  isMainBoxColor,
  isRightClickedSquare,
  legalMoves,
  setBoard,
  setFrom,
  setGameOver,
  setLegalMoves,
  setMoves,
  socket,
  square,
  squareRepresentation,
  started,
  isMyTurn,
  myColor,
}: ChessSquareProps) => {
  const handleTriggerPiece = () => {
    setFrom(squareRepresentation);
    setLegalMoves(
      chess
        .moves({ verbose: true, square: square?.square })
        .map((move) => move.to),
    );
  };

  const handleCanMakeMove = () => {
    if (!started) {
      return false;
    }
    if (!from && square?.color !== chess.turn()) return false;
    if (!isMyTurn) return false;
    return true;
  };

  const handleMakeMove = () => {
    if (!from) return;
    try {
      let moveResult;
      if (isPromoting(chess, from, squareRepresentation)) {
        moveResult = chess.move({
          from,
          to: squareRepresentation,
          promotion: 'q',
        });
      } else {
        moveResult = chess.move({
          from,
          to: squareRepresentation,
        });
      }
      if (moveResult) {
        moveAudio.play();

        if (moveResult?.captured) {
          captureAudio.play();
        }

        if (moveResult.san.includes('#')) {
          setGameOver(true);
        }
      }
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            gameId,
            move: {
              from,
              to: squareRepresentation,
            },
          },
        }),
      );
      setFrom(null);
      setLegalMoves([]);
      setBoard(chess.board());
      const piece = chess.get(squareRepresentation)?.type;
      setMoves((moves) => [
        ...moves,
        { from, to: squareRepresentation, piece },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  // eslint-disable-next-line no-empty-pattern
  const [{}, drop] = useDrop(
    () => ({
      accept: 'chess-piece',
      canDrop: () => !!from && legalMoves.includes(squareRepresentation),
      drop: () => handleMakeMove(),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [from, legalMoves, isMyTurn],
  );

  return (
    <div
      ref={drop}
      onClick={() => {
        if (!started) {
          return;
        }
        if (!from && square?.color !== chess.turn()) return;
        if (!isMyTurn) return;
        if (from === squareRepresentation) {
          setFrom(null);
          return;
        }

        if (!from || square?.color === myColor) {
          handleTriggerPiece();
        } else {
          handleMakeMove();
        }
      }}
      style={{
        width: boxSize,
        height: boxSize,
      }}
      key={j}
      className={`${isRightClickedSquare ? (isMainBoxColor ? 'bg-[#CF664E]' : 'bg-[#E87764]') : isHighlightedSquare ? `${isMainBoxColor ? 'bg-[#BBCB45]' : 'bg-[#F4F687]'}` : isMainBoxColor ? 'bg-[#739552]' : 'bg-[#EBEDD0]'} ${''}`}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        handleMouseDown(e, squareRepresentation);
      }}
      onMouseUp={(e) => {
        handleMouseUp(e, squareRepresentation);
      }}
    >
      <div className="w-full justify-center flex h-full relative">
        {square && (
          <Piece
            square={square}
            handleTriggerPiece={handleTriggerPiece}
            handleCanMakeMove={handleCanMakeMove}
            isMyTurn={isMyTurn}
            started={started}
          />
        )}
        {isFlipped
          ? i === 8 && (
              <LetterNotation label={labels[j]} isMainBoxColor={j % 2 !== 0} />
            )
          : i === 1 && (
              <LetterNotation label={labels[j]} isMainBoxColor={j % 2 !== 0} />
            )}
        {!!from && legalMoves.includes(squareRepresentation) && (
          <LegalMoveIndicator
            isMainBoxColor={isMainBoxColor}
            isPiece={!!square?.type}
          />
        )}
      </div>
    </div>
  );
};

export default ChessSquare;
