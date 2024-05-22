import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ChessBoard, Container, Loading } from '~/components';
import { GAME_OVER, INIT_GAME, MOVE } from '~/constants';
import { WebSocketProvider, useWebSocket } from '~/contexts/wsContext';
import { useChess } from '~/hooks/useChess';
import { chessState, lastmove } from '~/store/atoms';

export function GameComponent() {
  const [isWaiting, setWaiting] = useState(true);
  const { socket, isConnected } = useWebSocket();
  const chess = useRecoilValue(chessState);
  const { makeMove } = useChess();
  const setRecentMove = useSetRecoilState(lastmove);

  useEffect(() => {
    if (!socket) {
      console.log('GameComponent: Socket is null in useEffect');
      return;
    }
    console.log('GameComponent: Sending INIT_GAME message');
    socket.send(
      JSON.stringify({
        type: INIT_GAME,
      })
    );

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('GameComponent: Received message', message);
      switch (message.type) {
        case INIT_GAME:
          console.log('Game initialized');
          setWaiting(false);

          break;
        case MOVE:
          console.log('Move made');
          const move = message.payload;
          makeMove(move);
          setRecentMove({ from: move.from, to: move.to });
          console.log(chess.turn());

          break;
        case GAME_OVER:
          console.log('Game finished');
          break;
        default:
          break;
      }
    };
  }, [socket]);

  return (
    <>
      <Container className="bg-slate-950">
        <ChessBoard />
      </Container>
      {(!isConnected || isWaiting) && (
        <View className="absolute h-full w-full items-center justify-center bg-black/50">
          <Loading className="bg-slate-950" />
        </View>
      )}
    </>
  );
}

export default function Game() {
  return (
    <WebSocketProvider>
      <GameComponent />
    </WebSocketProvider>
  );
}
