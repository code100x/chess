import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Container, Loading, ChessBoard } from '~/components';
import { GAME_OVER, INIT_GAME, MOVE } from '~/constants';
import useSocket from '~/hooks/useSocket';

export default function Game() {
  const { socket, isConnected } = useSocket();
  const [isWaiting, setWaiting] = useState(true);
  const [chess, setChess] = useState(new Chess());

  useEffect(() => {
    if (!socket) return;

    socket.send(JSON.stringify({
      type: INIT_GAME,
    }));

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case INIT_GAME:
          console.log("Game initialized");
          setWaiting(false);
          break;
        case MOVE:
          console.log("Move made");
          const move = message.payload;
          chess.move(move);
          break;
        case GAME_OVER:
          console.log("Game finished");
          break;
        default:
          break;
      }
    }
  }, [socket]);

  return (
    <>
      <Container className="bg-slate-950">
        <ChessBoard board={chess.board()} />
      </Container>
      {(!isConnected || isWaiting) && <View className="absolute h-full w-full items-center justify-center bg-black/50">
        <Loading className="bg-slate-950" />
      </View>}
    </>
  );
}
