import type { ChessInstance } from 'chess.js';

type ChessboardStateFunctions = Pick<
  ChessInstance,
  | 'in_check'
  | 'in_checkmate'
  | 'in_draw'
  | 'in_stalemate'
  | 'in_threefold_repetition'
  | 'insufficient_material'
  | 'game_over'
  | 'fen'
  | 'pgn'
>;

type RecordReturnTypes<T> = {
  readonly [P in keyof T]: T[P] extends () => any ? ReturnType<T[P]> : T[P];
};

export type ChessboardState = RecordReturnTypes<ChessboardStateFunctions>;

export const getChessboardState = (chess: ChessInstance): ChessboardState => {
  return {
    in_check: chess.in_check(),
    in_checkmate: chess.in_checkmate(),
    in_draw: chess.in_draw(),
    in_stalemate: chess.in_stalemate(),
    in_threefold_repetition: chess.in_threefold_repetition(),
    insufficient_material: chess.insufficient_material(),
    game_over: chess.game_over(),
    fen: chess.fen(),
    pgn: chess.pgn(),
  };
};
