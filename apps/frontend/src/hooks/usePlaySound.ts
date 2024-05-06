import { Move } from 'chess.js';

export const usePlaySound = () => {
  const moveAudio = new Audio('/move.wav');
  const captureAudio = new Audio('/capture.wav');

  const playSound = (move: Move) => {
    if (move.captured) {
      captureAudio.play();
    } else {
      moveAudio.play();
    }
  };

  return playSound;
};
