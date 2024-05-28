import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ChessBoard, Container, Loading, PlayerDetail } from '~/components';
import { GAME_OVER, INIT_GAME, MOVE, GAME_ADDED } from '~/constants';
import { WebSocketProvider, useWebSocket } from '~/contexts/wsContext';
import { useChess } from '~/hooks/useChess';
import { blackPlayer, chessState, gameId, isFlipped, lastmove, whitePlayer } from '~/store/atoms';

export function GameComponent() {
  const [isWaiting, setWaiting] = useState<GameStatus>('idle');
  const { socket, isConnected } = useWebSocket();
  const chess = useRecoilValue(chessState);
  const { makeMove } = useChess();
  const setRecentMove = useSetRecoilState(lastmove);
  const setGameId = useSetRecoilState(gameId);
  const setBlackPlayer = useSetRecoilState(blackPlayer);
  const setWhitePlayer = useSetRecoilState(whitePlayer);
  const flipped = useRecoilValue(isFlipped);
  useEffect(() => {
    if (!socket) {
      console.log('GameComponent: Socket is null in useEffect');
      return;
    }
    console.log('GameComponent: Sending INIT_GAME message');
    setWaiting('connecting');
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
          setWaiting('idle');
          setGameId(message.payload.gameId);
          setBlackPlayer(message.payload.blackPlayer);
          setWhitePlayer(message.payload.whitePlayer);
          break;
        case MOVE:
          console.log('Move made');
          const { move } = message.payload;
          makeMove(move);
          setRecentMove({ from: move.from, to: move.to });
          console.log(chess.turn());
          break;
        case GAME_OVER:
          console.log('Game finished');
          break;
        case GAME_ADDED:
          console.log('Game added');
          setWaiting('waiting');
          break;
        default:
          break;
      }
    };
  }, [socket]);

  return (
    <>
      <Container className="bg-slate-950">
        <PlayerDetail isBlack={!flipped} />
        <ChessBoard />
        <PlayerDetail isBlack={flipped} />
      </Container>
      {(!isConnected || isWaiting !== 'idle') && (
        <View className="absolute h-full w-full items-center justify-center bg-black/50">
          <Loading
            className="bg-slate-950"
            message={isWaiting === 'waiting' ? 'Waiting for opponent' : undefined}
          />
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
