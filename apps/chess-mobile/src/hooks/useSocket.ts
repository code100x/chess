import { useEffect, useState } from 'react';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

export default function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}`);

    ws.onopen = () => {
      console.log('CONNECTED');
      setSocket(ws);
      setConnected(true);
    };

    ws.onclose = () => {
      console.log('DISCONNECTED');
      setSocket(null);
      setConnected(true);
    };

    return () => {
      ws.close();
    };
  }, []);
  return { socket, isConnected };
}
