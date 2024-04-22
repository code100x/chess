export const Message = {
  INIT_GAME: 'init_game',
  MOVE: 'move',
  OPPONENT_DISCONNECTED: 'opponent_disconnected',
  GAME_OVER: 'game_over',
  JOIN_ROOM: 'join_room',
  GAME_JOINED: 'game_joined',
  GAME_ALERT: 'game_alert',
  GAME_ADDED: 'game_added',
  USER_TIMEOUT: 'user_timeout',
  GAME_TIME: 'game_time',
  GAME_ENDED: 'game_ended',
  GAME_NOT_FOUND: 'game_not_found',
} as const;

export type MessageType = keyof typeof Message;
