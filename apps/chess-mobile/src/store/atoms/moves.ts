import { Move } from 'chess.js';
import { atom, selector } from 'recoil';

export const moveStore = atom<Move[]>({
  key: 'moveStore',
  default: [],
});

export const moveSelector = selector({
  key: 'moveStore/moveSelector',
  get: ({ get }) => {
    const moves = get(moveStore);
    const movesArray = moves.reduce((result, _, index: number, array: Move[]) => {
      if (index % 2 === 0) {
        result.push(array.slice(index, index + 2));
      }
      return result;
    }, [] as Move[][]);
    return movesArray;
  },
});

export const selectedMoveIndex = atom<number | null>({
  key: 'selectedMoveIndex',
  default: null,
});

export const currMoveIndex = selector({
  key: 'currentMove',
  get: ({ get }) => {
    const userSelected = get(selectedMoveIndex);
    const moves = get(moveStore);
    return userSelected ?? moves.length - 1;
  },
});
