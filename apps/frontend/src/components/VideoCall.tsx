import { LucideIcon, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import React, { SetStateAction, useState } from 'react';
import { cn } from '../lib/utils';

type VideoRefs = React.MutableRefObject<HTMLVideoElement | null>;

export type TVideoCallProps = {
  localVideoRef: VideoRefs;
  remoteVideoRef: VideoRefs;
  setLocalVideoTracks: React.Dispatch<SetStateAction<MediaStreamTrack | null>>;
  setLocalAudioTracks: React.Dispatch<SetStateAction<MediaStreamTrack | null>>;
  videoStyles?: string;
};

export const VideoCall: React.FC<TVideoCallProps> = ({
  localVideoRef,
  remoteVideoRef,
  setLocalAudioTracks,
  setLocalVideoTracks,
  videoStyles,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);

  const MicIcon: LucideIcon = isMuted ? MicOff : Mic;
  const VideoIcon: LucideIcon = isVideoOn ? Video : VideoOff;

  return (
    <div className="relative">
      <div className="w-full h-full relative">
        <video
          autoPlay
          ref={remoteVideoRef}
          className={cn(
            'max-w-full h-48 peer object-fill rounded-sm w-80',
            videoStyles,
          )}
        />
        <div className="hover:flex items-center justify-center z-30 absolute peer-hover:flex gap-4 hidden bottom-4 -translate-x-1/2 left-1/2 text-gray-500">
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
        className="absolute object-fill w-24 h-14 z-20 rounded-sm bottom-4 left-4 border border-gray-400"
        autoPlay
        ref={localVideoRef}
      />
    </div>
  );
};
