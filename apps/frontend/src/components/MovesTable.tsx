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
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { videoCallRequestStatusAtom } from '@repo/store/videoCall';

type TMovesTableProps = {
  started: boolean;
  processVideoCall: () => void;
};

const MovesTable: React.FC<TMovesTableProps> = ({
  started,
  processVideoCall,
}) => {
  const [userSelectedMoveIndex, setUserSelectedMoveIndex] = useRecoilState(
    userSelectedMoveIndexAtom,
  );
  const setIsFlipped = useSetRecoilState(isBoardFlippedAtom);
  const moves = useRecoilValue(movesAtom);
  const movesTableRef = useRef<HTMLInputElement>(null);
  const movesArray = moves.reduce((result, _, index: number, array: Move[]) => {
    if (index % 2 === 0) {
      result.push(array.slice(index, index + 2));
    }
    return result;
  }, [] as Move[][]);
  const [videoCallState, setVideoCallState] = useRecoilState(
    videoCallRequestStatusAtom,
  );
  const REQUEST_TIMEOUT = 10 * 1000;
  const [timeRemaining, setTimeRemaining] = useState(REQUEST_TIMEOUT);
  const [intervalTimer, setIntervalTimer] = useState<Timer | undefined>();
  const [timeoutTimer, setTimeoutTimer] = useState<Timer | undefined>();
  useEffect(() => {
    if (movesTableRef && movesTableRef.current) {
      movesTableRef.current.scrollTo({
        top: movesTableRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [moves]);

  useEffect(() => {
    if (videoCallState === 'Locked') {
      setTimeRemaining(REQUEST_TIMEOUT);
      clearTimeout(timeoutTimer);
      clearInterval(intervalTimer);
      setIntervalTimer(
        setInterval(() => {
          setTimeRemaining((prev) => prev - 1000);
        }, 1000),
      );
      setTimeoutTimer(
        setTimeout(() => {
          setVideoCallState('Idle');
          clearInterval(intervalTimer);
        }, REQUEST_TIMEOUT),
      );
    }
    if (videoCallState === 'Accepted') {
      clearTimeout(timeoutTimer);
      clearInterval(intervalTimer);
      setTimeRemaining(REQUEST_TIMEOUT);
    }
  }, [videoCallState]);

  return (
    <div
      className={cn(
        'text-[#C3C3C0] relative text-sm h-full rounded-sm p-4 flex flex-col',
        started && 'bg-[#272522]',
      )}
      ref={movesTableRef}
    >
      {started && (
        <Button
          className="bg-green-500 hover:bg-green-500"
          onClick={() => {
            processVideoCall();
          }}
          disabled={videoCallState === 'Locked' || videoCallState === 'Pending'}
        >
          {videoCallState === 'Idle'
            ? 'Request a video call'
            : videoCallState === 'Pending'
              ? 'Awaiting response...'
              : videoCallState === 'Accepted'
                ? 'Leave video call'
                : `Retry after ${Math.ceil(timeRemaining / 1000)}`}
        </Button>
      )}
      <div className="w-full flex flex-grow flex-col overflow-y-auto scrollbar pt-10">
        {started && (
          <p className="border-b border-[#5A5858]  p-2 font-bold">
            Starting position
          </p>
        )}
        {movesArray.map((movePairs, index) => {
          return (
            <div
              key={index}
              className={cn(
                'w-full font-bold items-stretch py-6',
                index % 2 !== 0 ? 'bg-[#2B2927]' : '',
              )}
            >
              <div className="grid grid-cols-6 gap-16 w-4/5">
                <span className="text-[#C3C3C0] px-2 py-1.5">{`${index + 1}.`}</span>

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
      {started && (
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
          <div className="flex gap-1 items-center">
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
      )}
    </div>
  );
};

export default MovesTable;
