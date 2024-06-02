import { useEffect } from 'react';
import { View } from 'react-native';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  ChessBoard,
  ChessBoardUI,
  Container,
  GameEnd,
  Loading,
  MovesTable,
  PlayerDetail,
  Turn,
} from '~/components';
import { INIT_GAME, MOVE, GAME_ADDED, GAME_ENDED } from '~/constants';
import { WebSocketProvider, useWebSocket } from '~/contexts/wsContext';
import { useChess } from '~/hooks/useChess';
import {
  blackPlayer,
  blackTimeConsumed,
  chessState,
  gameId,
  gameResult,
  gameStatus,
  isFlipped,
  lastmove,
  moveStore,
  selectedMoveIndex,
  whitePlayer,
  whiteTimeConsumed,
} from '~/store/atoms';

export function GameComponent() {
  const [status, setGameStatus] = useRecoilState(gameStatus);
  const { socket, isConnected } = useWebSocket();
  const chess = useRecoilValue(chessState);
  const { makeMove } = useChess();
  const setRecentMove = useSetRecoilState(lastmove);
  const setGameId = useSetRecoilState(gameId);
  const setBlackPlayer = useSetRecoilState(blackPlayer);
  const setWhitePlayer = useSetRecoilState(whitePlayer);
  const setBlackTimeConsumed = useSetRecoilState(blackTimeConsumed);
  const setWhiteTimeConsumed = useSetRecoilState(whiteTimeConsumed);
  const storeMoves = useSetRecoilState(moveStore);
  const setSelectedMove = useSetRecoilState(selectedMoveIndex);
  const setResult = useSetRecoilState(gameResult);
  const flipped = useRecoilValue(isFlipped);
  useEffect(() => {
    if (!socket) {
      console.log('GameComponent: Socket is null in useEffect');
      return;
    }
    console.log('GameComponent: Sending INIT_GAME message');
    setGameStatus('connecting');
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
          setGameStatus('started');
          setGameId(message.payload.gameId);
          setBlackPlayer(message.payload.blackPlayer);
          setWhitePlayer(message.payload.whitePlayer);
          break;
        case MOVE:
          console.log('Move made');
          const { move, player1TimeConsumed, player2TimeConsumed } = message.payload;
          setSelectedMove(null);
          makeMove(move);
          setWhiteTimeConsumed(player1TimeConsumed);
          setBlackTimeConsumed(player2TimeConsumed);
          setRecentMove({ from: move.from, to: move.to });
          storeMoves((moves) => [...moves, move]);
          console.log(chess.turn());
          break;
        case GAME_ENDED:
          console.log('Game finished');
          setGameStatus('completed');
          const wonBy =
            message.payload.status === 'COMPLETED'
              ? message.payload.result !== 'DRAW'
                ? 'CheckMate'
                : 'Draw'
              : ('Timeout' as GameWonBy);
          setResult({ result: message.payload.result as Result, by: wonBy });
          break;
        case GAME_ADDED:
          console.log('Game added');
          setGameStatus('waiting');
          break;
        default:
          break;
      }
    };
  }, [socket]);

  useEffect(() => {
    if (status !== 'started') return;
    const turn = chess.turn() === 'b';

    const timeInterval = setInterval(() => {
      if (turn) {
        setBlackTimeConsumed((curr) => curr + 100);
      } else {
        setWhiteTimeConsumed((curr) => curr + 100);
      }
    }, 100);
    return () => clearInterval(timeInterval);
  }, [status, chess]);
  return (
    <>
      <Container className="bg-slate-950">
        <Turn />
        <PlayerDetail isBlack={!flipped} />
        {(status === 'started' || status === 'completed') && <ChessBoard />}
        {(!isConnected || (status !== 'started' && status !== 'completed')) && <ChessBoardUI />}
        <PlayerDetail isBlack={flipped} />
        <MovesTable />
      </Container>
      {(!isConnected || (status !== 'started' && status !== 'completed')) && (
        <View className="absolute h-full w-full items-center justify-center bg-black/50">
          <Loading
            className="bg-slate-950"
            message={status === 'waiting' ? 'Waiting for opponent' : undefined}
          />
        </View>
      )}
      {status === 'completed' && <GameEnd />}
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
