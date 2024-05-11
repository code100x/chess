import {
  isBoardFlippedAtom,
  movesAtom,
  userSelectedMoveIndexAtom,
} from '@repo/store/chessBoard';
import { Move } from 'chess.js';
import { useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  HandshakeIcon,
  FlagIcon,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowUpDownIcon,
} from 'lucide-react';
import { ChatRoom } from './ChatRoom';

const MovesTable = ({
  gameId,
  socket,
  myMessage,
  started,
}: {
  gameId: string;
  socket: WebSocket;
  myMessage: string;
  started: boolean;
}) => {
  const [userSelectedMoveIndex, setUserSelectedMoveIndex] = useRecoilState(
    userSelectedMoveIndexAtom,
  );
  const setIsFlipped = useSetRecoilState(isBoardFlippedAtom);
  const moves = useRecoilValue(movesAtom);
  const movesTableRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState<boolean>(false);
  const [toggleMove, setToggleMove] = useState<boolean>(true);
  const movesArray = moves.reduce((result, _, index: number, array: Move[]) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, [] as Move[][]);

  useEffect(() => {
    if (movesTableRef && movesTableRef.current) {
      movesTableRef.current.scrollTo({
        top: movesTableRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [moves]);
  return (
    <div className="text-[#C3C3C0] relative w-full">
      {started ? (
        <div className="w-[100vh] p-2 bg-[#20211D] flex items-center justify-between">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 hover:bg-[#32302E] rounded px-2.5 py-1">
              {<HandshakeIcon size={16} />}
              Draw
            </button>
            <button className="flex items-center gap-2 hover:bg-[#32302E] rounded px-2.5 py-1">
              {<FlagIcon size={16} />}
              Resign
            </button>
            <button
              className="flex items-center gap-2 hover:bg-[#32302E] rounded px-2.5 py-1 border relative"
              onClick={() => {
                setToggleMove((p) => !p);
                setNewMessage(false);
              }}
            >
              {<ArrowUpDownIcon size={16} />}
              {toggleMove ? 'Moves' : 'Message'}
              {toggleMove && newMessage && (
                <span className=" absolute top-1 right-1 bg-red-700 text-white text-xs py-1 px-1 rounded-full leading-3">
                  {' '}
                </span>
              )}
            </button>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => {
                setUserSelectedMoveIndex(0);
              }}
              disabled={userSelectedMoveIndex === 0}
              className="hover:text-white"
              title="Go to first move"
            >
              <ChevronFirst />
            </button>

            <button
              onClick={() => {
                setUserSelectedMoveIndex((prev) =>
                  prev !== null ? prev - 1 : moves.length - 2,
                );
              }}
              disabled={userSelectedMoveIndex === 0}
              className="hover:text-white"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => {
                setUserSelectedMoveIndex((prev) =>
                  prev !== null
                    ? prev + 1 >= moves.length - 1
                      ? moves.length - 1
                      : prev + 1
                    : null,
                );
              }}
              disabled={userSelectedMoveIndex === null}
              className="hover:text-white"
            >
              <ChevronRight />
            </button>
            <button
              onClick={() => {
                setUserSelectedMoveIndex(moves.length - 1);
              }}
              disabled={userSelectedMoveIndex === null}
              className="hover:text-white"
              title="Go to last move"
            >
              <ChevronLast />
            </button>
            <button
              onClick={() => {
                setIsFlipped((prev) => !prev);
              }}
              title="Flip the board"
            >
              <RefreshCw className="hover:text-white mx-2" size={18} />
            </button>
          </div>
        </div>
      ) : null}
      <div
        className="text-sm h-[65vh] max-h-[85vh] overflow-y-auto w-full"
        ref={movesTableRef}
      >
        <div className={`${toggleMove ? 'block' : 'hidden'}`}>
          {movesArray.map((movePairs, index) => {
            return (
              <div
                key={index}
                className={`w-full py-px px-4 font-bold items-stretch ${index % 2 !== 0 ? 'bg-[#2B2927]' : ''}`}
              >
                <div className="grid grid-cols-6 gap-16 w-4/5">
                  <span className="text-[#C3C3C0] px-1.5 py-1.5">{`${index + 1}.`}</span>

                  {movePairs.map((move, movePairIndex) => {
                    const isLastIndex =
                      movePairIndex === movePairs.length - 1 &&
                      movesArray.length - 1 === index;
                    const isHighlighted =
                      userSelectedMoveIndex !== null
                        ? userSelectedMoveIndex === index * 2 + movePairIndex
                        : isLastIndex;
                    const { san } = move;

                    return (
                      <div
                        key={movePairIndex}
                        className={`col-span-2 cursor-pointer flex items-center w-full pl-1 ${isHighlighted ? 'bg-[#484644] rounded border-b-[#5A5858] border-b-[3px]' : ''}`}
                        onClick={() => {
                          setUserSelectedMoveIndex(index * 2 + movePairIndex);
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
        <div className={`${toggleMove ? 'hidden' : 'block'} w-full`}>
          <ChatRoom
            gameId={gameId ?? ''}
            socket={socket}
            myMessage={myMessage}
            setNewMessage={setNewMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default MovesTable;
