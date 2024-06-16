import { useEffect, useState } from 'react';
import { useUser } from '@repo/store/useUser';
import { SFUMessageType } from '@repo/common/types';

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
      setTimeout(()=>{
        ws.send(
          JSON.stringify({
            type: SFUMessageType.JOIN_ROOM,
            payload: { roomId: '1' },
          }),
        );
      }, 500)
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return { socket, localStream };
};
