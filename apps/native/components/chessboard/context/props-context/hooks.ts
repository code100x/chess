import { useContext } from 'react';
import { ChessboardPropsContext } from './index';

export const useChessboardProps = () => useContext(ChessboardPropsContext);
