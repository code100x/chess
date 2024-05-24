import { useUser } from '@repo/store/useUser';
import { useSfu } from '../hooks/useSfu';
import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Meet = () => {
  const user = useUser();

  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  // consumers videos ref

  const { roomId } = useParams();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  const { videoProducer, audioProducer, consumers } = useSfu(roomId!, user);

  useEffect(() => {
    if (!videoRef.current) return;
    const stream = new MediaStream();
    if (videoProducer && videoProducer.track) {
      stream.addTrack(videoProducer.track);
    }
    if (audioProducer && audioProducer.track) {
      stream.addTrack(audioProducer.track);
    }
    videoRef.current.srcObject = stream;
  }, [videoProducer, audioProducer]);

  if (!user) {
    return <div>Redirecting to Login ... </div>;
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <header className="p-4 mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meeting</h1>
      </header>
      <div className="flex-1 flex-row">
        {[
          { type: 'Producer', track: videoProducer, audio: audioProducer },
          ...consumers.map((consumer, index) => ({
            type: `Consumer ${index + 1}`,
            track: consumer.videoConsumer,
            audio: consumer.audioConsumer,
          })),
        ].map((user, index) => (
          <div
            key={index}
            className="p-2 rounded-md shadow-md flex flex-col items-center w-80"
          >
            <VideoPlayer
              videoTrack={user.track ? user.track.track : null}
              audioTrack={user.audio ? user.audio.track : null}
              onPause={() => {
                user.audio?.pause();
                user.track?.pause();
              }}
              onPlay={() => {
                user.track?.resume();
                user.audio?.resume();
              }}
            />
            <p className="text-white mt-2">{user.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoPlayer: React.FC<{
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
  onPlay: () => void;
  onPause: () => void;
}> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const stream = new MediaStream();
      if (props.audioTrack) {
        stream.addTrack(props.audioTrack);
      }
      if (props.videoTrack) {
        stream.addTrack(props.videoTrack);
      }
      videoRef.current.srcObject = stream;
      videoRef.current.onplay = props.onPlay;
      videoRef.current.onpause = props.onPause;
    }
  }, [props.audioTrack, props.videoTrack, props.onPlay, props.onPause]);

  return (
    <div className="flex flex-col items-center justify-center">
      <video
        ref={videoRef}
        className="w-50 rounded-md shadow-md"
        autoPlay
        controls
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};


export default Meet;
