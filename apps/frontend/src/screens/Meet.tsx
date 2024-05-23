import { useUser } from '@repo/store/useUser';
import { useSfu } from '../hooks/useSfu';
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Meet = () => {
  
  const user = useUser();

  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  // consumers videos ref

  const {roomId} = useParams();

  useEffect(() => {
    if(!user) {
      navigate('/login');
    }
  },[user]);

  const {
    videoProducer,
    audioProducer,
    consumers,
  } = useSfu(roomId!, user);


  useEffect(() => {
    if (!videoRef.current) return;
    const stream = new MediaStream();
    if(videoProducer && videoProducer.track) {
      stream.addTrack(videoProducer.track);
    }
    if(audioProducer && audioProducer.track) {
      stream.addTrack(audioProducer.track);
    }
    videoRef.current.srcObject = stream;
  }, [videoProducer,audioProducer]);

  if (!user) {
    return <div>Redirecting to Login ... </div>;
  }

  return (
    <div>
      <h1>Meeting</h1>
      <div>
        <h2>Producer</h2>
          <VideoPlayer
            videoTrack={videoProducer ? videoProducer.track : null}
            audioTrack={audioProducer ? audioProducer.track : null}
            onPause={() => {
              audioProducer?.pause();
              videoProducer?.pause();
            }}
            onPlay={() => {
              videoProducer?.resume();
              audioProducer?.resume();
            }}
          />
      </div>
      <div>
        <h2>Consumers</h2>
        {consumers.map((consumer, index) => (
          console.log('CONSUMER in here', consumer),
          <div key={consumer.id}>
            <p>Consumer {index + 1} is active</p>
            <VideoPlayer
              videoTrack={consumer.videoConsumer ? consumer.videoConsumer.track : null}
              audioTrack={consumer.audioConsumer ? consumer.audioConsumer.track : null}
              onPause={() => {
                consumer.audioConsumer?.pause();
                consumer.videoConsumer?.pause();
              }}
              onPlay={() => {
                consumer.audioConsumer?.resume();
                consumer.videoConsumer?.resume();
              }}
            />
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
  });

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <video
        ref={videoRef}
        className="w-full max-w-2xl"
        autoPlay={true}
        controls
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Meet;
