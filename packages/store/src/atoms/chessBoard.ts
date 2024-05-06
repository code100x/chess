import { Move, Chess } from 'chess.js';
import { atom } from "recoil";
export enum BoardOrientation {
    BLACK = 'black',
    WHITE = 'white',
  }

export const isBoardFlippedAtom = atom({
    key: "isBoardFlippedAtom",
    default: false,
})

export const movesAtom = atom<Move[]>({
    key: "movesAtom",
    default: []
})

export const selectedMoveIndexAtom = atom<number | null>({
    key: 'selectedMoveIndex',
    default: null
});

export const liveGamePositionAtom = atom<string>({
    key:"liveGamePositionAtom",
    default: new Chess().fen()
})

export const boardOrientationAtom = atom<BoardOrientation>({
    key: "boardOrientationAtom",
    default: BoardOrientation.WHITE
})

