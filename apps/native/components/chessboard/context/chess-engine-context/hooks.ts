import { useContext } from 'react';

import { ChessEngineContext } from './index';

export const useChessEngine = () => {
  return useContext(ChessEngineContext);
};
