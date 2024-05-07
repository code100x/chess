import {
  isBoardFlippedAtom,
  movesAtom,
  userSelectedMoveIndexAtom,
} from '@repo/store/chessBoard';
import { Move } from 'chess.js';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  HandshakeIcon,
  FlagIcon,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mic,
  MicOff,
  LucideIcon,
  Video,
  VideoOff,
} from 'lucide-react';
import { cn } from '../lib/utils';

type VideoRefs = React.MutableRefObject<HTMLVideoElement | null>;

type TMovesTableProps = {
  started: boolean;
  localVideoRef: VideoRefs;
  remoteVideoRef: VideoRefs;
  setLocalVideoTracks: React.Dispatch<SetStateAction<MediaStreamTrack | null>>;
  setLocalAudioTracks: React.Dispatch<SetStateAction<MediaStreamTrack | null>>;
};

const MovesTable: React.FC<TMovesTableProps> = ({
  started,
  localVideoRef,
  remoteVideoRef,
  setLocalVideoTracks,
  setLocalAudioTracks,
}) => {
  const [userSelectedMoveIndex, setUserSelectedMoveIndex] = useRecoilState(
    userSelectedMoveIndexAtom,
  );
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const setIsFlipped = useSetRecoilState(isBoardFlippedAtom);
  const moves = useRecoilValue(movesAtom);
  const movesTableRef = useRef<HTMLInputElement>(null);
  const MicIcon: LucideIcon = isMuted ? MicOff : Mic;
  const VideoIcon: LucideIcon = isVideoOn ? Video : VideoOff;
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
    <div
      className={cn(
        'text-[#C3C3C0] relative text-sm h-full rounded-sm p-4 flex flex-col',
        started && 'bg-[#272522]',
      )}
      ref={movesTableRef}
    >
      {started && (
        <div className="flex relative w-full justify-center items-center">
          <div className="w-full h-full relative">
            <video
              autoPlay
              ref={remoteVideoRef}
              className="max-w-full h-auto peer object-fill xl:w-[500px] xl:h[250px]"
            />
            <div className="hover:flex items-center justify-center z-30 absolute peer-hover:flex gap-4 hidden bottom-4 left-[45%] text-gray-500">
              <MicIcon
                className="size-6 active:scale-95 cursor-pointer"
                onClick={() => {
                  setLocalAudioTracks((prevAudioTrack) => {
                    if (prevAudioTrack) {
                      prevAudioTrack.enabled = !isMuted;
                    }
                    return prevAudioTrack;
                  });
                  setIsMuted((prevMuted) => !prevMuted);
                }}
              />
              <VideoIcon
                className="size-6 active:scale-95 cursor-pointer"
                onClick={() => {
                  setLocalVideoTracks((prevVideoTrack) => {
                    if (prevVideoTrack) {
                      prevVideoTrack.enabled = !isVideoOn;
                    }
                    return prevVideoTrack;
                  });
                  setIsVideoOn((prevIsVideoOn) => !prevIsVideoOn);
                }}
              />
            </div>
          </div>
          <video
            className="absolute object-fill w-44 h-24 z-20 rounded-sm bottom-4 left-4 border border-input"
            autoPlay
            ref={localVideoRef}
          />
        </div>
      )}
      <div className="w-full flex flex-grow flex-col overflow-y-auto scrollbar pt-10">
        {movesArray.map((movePairs, index) => {
          return (
            <div
              key={index}
              className={cn(
                'w-full font-bold items-stretch border-t border-input py-6',
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
      )}
    </div>
  );
};

export default MovesTable;
