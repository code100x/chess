import { useEffect, useState } from 'react';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

export default function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}`);

    ws.onopen = () => {
      console.log('CONNECTED');
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('DISCONNECTED');
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, []);
  return socket;
}
