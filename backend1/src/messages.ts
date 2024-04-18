export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const GAME_OVER = 'game_over';

export type MessageType = typeof INIT_GAME | typeof MOVE | typeof GAME_OVER;

export interface MovePayload {
  from: string;
  to: string;
}

export const INIT_GAME = "init_game";
export const MOVE = "move"; 
export const GAME_OVER = "game_over";