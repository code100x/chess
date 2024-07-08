import { useEffect, useState } from 'react';
// import { useUser } from "@repo/store/useUser";

const WS_URL = 'wss://chess-ws.100xdevs.com/';

const user = {
  token: '1234kkiioo',
};

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // const user = useUser();

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?token=${user.token}`);

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return socket;
};
