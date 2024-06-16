import { Move } from 'chess.js';
import { Move as DbMove, GameResult } from '@prisma/client';

export enum GameMessageType {
  INIT_GAME = 'init_game',
  MOVE = 'move',
  GAME_OVER = 'game_over',
  JOIN_ROOM = 'join_room',
  GAME_NOT_FOUND = 'game_not_found',
  GAME_JOINED = 'game_joined',
  GAME_ENDED = 'game_ended',
  GAME_ALERT = 'game_alert',
  GAME_ADDED = 'game_added',
}

export interface IOnInitGame {
  type: GameMessageType.INIT_GAME;
}
export interface IOnMove {
  type: GameMessageType.MOVE;
  payload: { gameId: string; move: Move };
}

export interface IOnJoinRoom {
  type: GameMessageType.JOIN_ROOM;
  payload: {
    gameId: string;
  };
}

export type ServerGameMessageReceived = IOnInitGame | IOnMove | IOnJoinRoom;
export type ClientGameMessageSent = ServerGameMessageReceived


interface Player {
  name: string | null;
  id: string;
}

export interface IGameAlert {
  type: GameMessageType.GAME_ALERT;
  payload: {
    message: string;
  };
}
export interface IGameAdded {
  type: GameMessageType.GAME_ADDED;
}
export interface IGameNotFound {
  type: GameMessageType.GAME_NOT_FOUND;
}

export interface IMove {
  type: GameMessageType.MOVE;
  payload: {
    move: Move;
    player1TimeConsumed: number;
    player2TimeConsumed: number;
  };
}

export interface IGameEnded {
  type: GameMessageType.GAME_ENDED;
  payload: {
    result: GameResult | null;
    status: string;
    moves: DbMove[];
    blackPlayer: Player;
    whitePlayer: Player;
  };
}

export interface IInitGame {
  type: GameMessageType.INIT_GAME;
  payload: {
    gameId: string;
    whitePlayer: Player;
    blackPlayer: Player;
    fen: string;
    moves: [];
  };
}

export interface IGameJoined {
  type: GameMessageType.GAME_JOINED;
  payload: {
    gameId: string;
    moves: DbMove[];
    blackPlayer: Player;
    whitePlayer: Player;
    player1TimeConsumed: number;
    player2TimeConsumed: number;
  };
}

export type ServerGameMessageSent = 
  | IGameAdded
  | IGameAlert
  | IGameEnded
  | IMove
  | IInitGame
  | IGameJoined
  | IGameNotFound;
export type ClientGameMessageReceived = ServerGameMessageSent