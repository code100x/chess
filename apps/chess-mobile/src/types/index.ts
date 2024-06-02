type User = {
  id: string;
  name: string;
  token: string;
};

type GameStatus = 'connecting' | 'waiting' | 'idle' | 'started' | 'completed';

type Result = 'WHITE_WINS' | 'BLACK_WINS';
type GameWonBy = 'CheckMate' | 'Draw' | 'Timeout';
