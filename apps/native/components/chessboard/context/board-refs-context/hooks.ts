import { useContext } from 'react';

import { PieceRefsContext, SquareRefsContext } from './contexts';

export const usePieceRefs = () => {
  return useContext(PieceRefsContext);
};

export const useSquareRefs = () => {
  return useContext(SquareRefsContext);
};
