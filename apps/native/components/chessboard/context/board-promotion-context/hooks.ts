import { useContext } from 'react';
import { BoardPromotionContext } from './index';

const useBoardPromotion = () => useContext(BoardPromotionContext);

export { useBoardPromotion, BoardPromotionContext };
