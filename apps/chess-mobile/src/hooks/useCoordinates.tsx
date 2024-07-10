import { Square } from 'chess.js';
import { useRecoilValue } from 'recoil';
import { isFlipped, squareSize } from '~/store/atoms';

export const useCoordinates = () => {
  const flipped = useRecoilValue(isFlipped);
  const size = useRecoilValue(squareSize);

  const squareToCoordinate = (square: Square) => {
    'worklet';
    const [rank, file] = square.split('');
    const x = flipped ? 7 - (rank.charCodeAt(0) - 97) : rank.charCodeAt(0) - 97;
    const y = flipped ? 7 - (8 - parseInt(file)) : 8 - parseInt(file);
    return { x: x * size, y: y * size };
  };

  const coordinateToSquare = ({ x, y }: { x: number; y: number }) => {
    'worklet';
    const xAxis = x / size;
    const yAxis = y / size;
    const file = String.fromCharCode(97 + Math.round(flipped ? 7 - xAxis : xAxis));
    const rank = 8 - Math.round(flipped ? 7 - yAxis : yAxis);
    return `${file}${rank}` as Square;
  };

  return { squareToCoordinate, coordinateToSquare };
};
