import { Chess } from 'chess.js';
import type { Fen, ShortMove } from './BotEngine';

export type UninitialisedBot = () => InitialisedBot;
export type InitialisedBot = (fen: Fen) => Promise<ShortMove>;
export type AvailableBots = Record<string, UninitialisedBot>;

const randomMove: UninitialisedBot = () => (fen) =>
  new Promise((resolve) => {
    const moves = new Chess(fen).moves({ verbose: true });
    const { from, to } = moves[Math.floor(Math.random() * moves.length)];
    setTimeout(() => resolve({ from, to }), 500);
  });

const uciWorker =
  (file: string, actions: Array<string>): UninitialisedBot =>
  () => {
    const worker = new Worker(file);

    let resolver: ((move: ShortMove) => void) | null = null;

    worker.addEventListener('message', (e) => {
      const move = e.data.match(/^bestmove\s([a-h][1-8])([a-h][1-8])/);
      if (move && resolver) {
        resolver({ from: move[1], to: move[2] });
        resolver = null;
      }
    });

    return (fen) =>
      new Promise((resolve, reject) => {
        if (resolver) {
          reject('Pending move is present');
          return;
        }

        resolver = resolve;
        worker.postMessage(`position fen ${fen}`);
        actions.forEach((action) => worker.postMessage(action));
      });
  };

const Bots: AvailableBots = {
  Random: randomMove,
  'Gukesh': uciWorker('/bots/stockfish.js-10.0.2/stockfish.js', [
    'setoption name Skill Level value 1',
    'go depth 10',
  ]),
  'Magnus': uciWorker('/bots/lozza-1.18/lozza.js', [
    'setoption name Skill Level value 20',
    'go movetime 1000',
  ]),
  'Hikaru': uciWorker('/bots/stockfish.js-10.0.2/stockfish.js', [
    'setoption name Skill Level value 20',
    'go depth 10',
  ]),
  'Vishy': uciWorker('/bots/stockfish.js-10.0.2/stockfish.js', [
    'setoption name Skill Level value 20',
    'go movetime 1000',
  ]),
  'Hou Yifan': uciWorker('/bots/lozza-1.18/lozza.js', [
    'setoption name Skill Level value 20',
    'go depth 10',
  ]),
};

export default Bots;
