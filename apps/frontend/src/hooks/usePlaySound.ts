import { Move } from 'chess.js';
import MoveSound from '/move.wav';
import CaptureSound from '/capture.wav';

export const usePlaySound = () => {
  const moveAudio = new Audio(MoveSound);
  const captureAudio = new Audio(CaptureSound);

  const playSound = (move: Move) => {
    if (move.captured) {
      captureAudio.play();
    } else {
      moveAudio.play();
    }
  };

  return playSound;
};
