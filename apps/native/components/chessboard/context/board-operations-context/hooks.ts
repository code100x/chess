import { useContext } from 'react';

import { BoardOperationsContext } from './index';

const useBoardOperations = () => {
  return useContext(BoardOperationsContext);
};

export { useBoardOperations };
