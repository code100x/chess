import {
  BoardOrientation,
  boardOrientationAtom,
  liveGamePositionAtom,
  selectedMoveIndexAtom,
} from '@repo/store/chessBoard';
import { Chess, Move } from 'chess.js';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  HandshakeIcon,
  FlagIcon,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const MovesTable = ({ chess }: { chess: Chess }) => {
  const setLiveGamePosition = useSetRecoilState(liveGamePositionAtom);
  const setBoardOrientation = useSetRecoilState(boardOrientationAtom);
  const movesTableRef = useRef<HTMLInputElement>(null);
  const moves = chess.history({ verbose: true });

  const [selectedMoveIndex, setSelectedMoveIndex] = useRecoilState(selectedMoveIndexAtom)

  const movesArray = moves.reduce((result, _, index: number, array: Move[]) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, [] as Move[][]);

  useEffect(() => {
    console.log("rerender");
    
    setSelectedMoveIndex(null);
    if (movesTableRef && movesTableRef.current) {
      movesTableRef.current.scrollTo({
        top: movesTableRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [moves]);

  const handleMoveSelection = (moveIndex: number | null) => {
    const move =
      moveIndex !== null ? moves[moveIndex] : moves[moves.length - 1];
    setLiveGamePosition(move.after);
    setSelectedMoveIndex(moveIndex);
  };

  const handleGoToMove = (moveIndex: number | null) => {
    if (moveIndex === null) {
      handleMoveSelection(null);
    } else {
      const newIndex = Math.max(0, Math.min(moves.length - 1, moveIndex));
      handleMoveSelection(newIndex);
    }
  };

  const goToFirstMove = () => handleGoToMove(0);
  const goToPreviousMove = () =>
    handleGoToMove(
      selectedMoveIndex === null ? moves.length - 2 : selectedMoveIndex - 1,
    );
  const goToNextMove = () =>
    handleGoToMove(selectedMoveIndex === null ? null : selectedMoveIndex + 1);
  const goToLastMove = () => handleGoToMove(null);

  return (
    <div className="text-[#C3C3C0] relative w-full ">
      <div
        className="text-sm h-[45vh] max-h-[45vh] overflow-y-auto"
        ref={movesTableRef}
      >
        {movesArray.map((movePairs, index) => {
          return (
            <div
              key={index}
              className={`w-full py-px px-4 font-bold items-stretch ${index % 2 !== 0 ? 'bg-[#2B2927]' : ''}`}
            >
              <div className="grid grid-cols-6 gap-16 w-4/5">
                <span className="text-[#C3C3C0] px-2 py-1.5">{`${index + 1}.`}</span>

                {movePairs.map((move, movePairIndex) => {
                  const moveIndex = index * 2 + movePairIndex;
                  const isLastIndex = moveIndex === moves.length - 1;
                  const isHighlighted =
                    selectedMoveIndex !== null
                      ? moveIndex === selectedMoveIndex
                      : isLastIndex;
                  const { san } = move;

                  return (
                    <div
                      key={movePairIndex}
                      className={`col-span-2 cursor-pointer flex items-center w-full pl-1 ${isHighlighted ? 'bg-[#484644] rounded border-b-[#5A5858] border-b-[3px]' : ''}`}
                      onClick={() => {
                        setLiveGamePosition(move.after);
                        setSelectedMoveIndex(isLastIndex ? null : moveIndex);
                      }}
                    >
                      <span className="text-[#C3C3C0]">{san}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {moves.length > 0 && (
        <div className="w-full p-2 bg-[#20211D] flex items-center justify-between">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 hover:bg-[#32302E] rounded px-2.5 py-1">
              {<HandshakeIcon size={16} />}
              Draw
            </button>
            <button className="flex items-center gap-2 hover:bg-[#32302E] rounded px-2.5 py-1">
              {<FlagIcon size={16} />}
              Resign
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={goToFirstMove}
              disabled={selectedMoveIndex === 0}
              className="hover:text-white"
              title="Go to first move"
            >
              <ChevronFirst />
            </button>

            <button
              onClick={goToPreviousMove}
              disabled={selectedMoveIndex === 0}
              className="hover:text-white"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={goToNextMove}
              disabled={
                selectedMoveIndex === null ||
                selectedMoveIndex === moves.length - 1
              }
              className="hover:text-white"
            >
              <ChevronRight />
            </button>
            <button
              onClick={goToLastMove}
              disabled={selectedMoveIndex === null}
              className="hover:text-white"
              title="Go to last move"
            >
              <ChevronLast />
            </button>
            <button
              onClick={() => {
                setBoardOrientation(prev=> prev === BoardOrientation.WHITE? BoardOrientation.BLACK: BoardOrientation.WHITE)
              }}
              title="Flip the board"
            >
              <RefreshCw className="hover:text-white mx-2" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovesTable;
