import { useEffect, useState } from 'react';
import { useUser } from '@repo/store/useUser';

const SFU_URL = import.meta.env.VITE_APP_SFU_URL ?? 'ws://localhost:8081';

export const useSfuSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const user = useUser();

  useEffect(() => {
    if (!user) return;
    const ws = new WebSocket(`${SFU_URL}?token=${user.token}`);

    ws.onopen = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(() => mediaStream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }

      ws.send(
        JSON.stringify({
          type: 'joinRoom',
          payload: {
            roomName: '1',
          },
        }),
      );
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return {socket, localStream};
};
