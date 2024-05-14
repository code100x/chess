import { Chess } from 'chess.js';
import { useEffect, useState } from 'react';
import { ChessBoardUI, Container } from '~/components';
import useSocket from '~/hooks/useSocket';

export default function Game() {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());

  useEffect(() => {
    console.log(socket);

  }, [socket])
  return (
    <Container className="bg-slate-950">
      <ChessBoardUI />
    </Container>
  );
}
