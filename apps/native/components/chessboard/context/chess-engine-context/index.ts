import type { ChessInstance } from 'chess.js';
import { createContext } from 'react';

const ChessEngineContext = createContext<ChessInstance>({} as any);

export { ChessEngineContext };
