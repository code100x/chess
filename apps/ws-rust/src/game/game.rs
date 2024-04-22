use crate::db::models::{Game, GameResult, GameStatus, Move, User};
use crate::messages::{GameEndedPayload, MovePayload};
use crate::socket_manager::SocketManager;
use chrono::{DateTime, Duration, Utc};
use shakmaty::{Chess, Position};
use std::collections::HashMap;
use std::sync::{Mutex};
use std::thread;
use std::time::Duration as StdDuration;

const GAME_TIME_MS: u64 = 10 * 60 * 60 * 1000; // 10 hours

pub struct GameState {
    game: Game,
    position: Position,
    chess: Chess,
    player1_time_consumed: u64,
    player2_time_consumed: u64,
    start_time: DateTime<Utc>,
    last_move_time: DateTime<Utc>,
    timer: Mutex<Option<std::thread::JoinHandle<()>>>,
    move_timer: Mutex<Option<std::thread::JoinHandle<()>>>,
}

impl GameState {
    pub fn new(game: Game) -> Self {
        let mut chess = Chess::default();
        let position = chess.position();
        let start_time = Utc::now();
        let last_move_time = start_time;

        GameState {
            game,
            position,
            chess,
            player1_time_consumed: 0,
            player2_time_consumed: 0,
            start_time,
            last_move_time,
            timer: Mutex::new(None),
            move_timer: Mutex::new(None),
        }
    }

    pub fn make_move(&mut self, move_payload: MovePayload, user_id: &str) -> Result<(), String> {
        if (self.chess.turn() == shakmaty::Color::White
            && self.game.white_player.id != user_id)
            || (self.chess.turn() == shakmaty::Color::Black
                && self.game.black_player.as_ref().unwrap().id != user_id)
        {
            return Err("Not your turn".to_

            string());
        }g

        if self.game.result.is_some() {
            return Err("Game is already completed".to_string());
        }

        let move_timestamp = Utc::now();
        let move_str = format!("{}{}", move_payload.from, move_payload.to);

        let move_obj = match self.chess.move_str(&move_str) {
            Ok(m) => m,
            Err(e) => return Err(format!("Invalid move: {}", e)),
        };

        self.chess.apply_move(move_obj);
        self.position = self.chess.position();

        let time_taken = move_timestamp.timestamp_millis() - self.last_move_time.timestamp_millis();

        if self.chess.turn() == shakmaty::Color::Black {
            self.player1_time_consumed += time_taken as u64;
        } else {
            self.player2_time_consumed += time_taken as u64;
        }

        let move_data = Move {
            id: uuid::Uuid::new_v4().to_string(),
            game_id: self.game.id.clone(),
            move_number: self.game.moves.len() as u64 + 1,
            from: move_obj.from.to_string(),
            to: move_obj.to.to_string(),
            comments: None,
            start_fen: self.chess.fen().to_string(),
            end_fen: self.position.fen().to_string(),
            time_taken: Some(time_taken as u64),
            created_at: move_timestamp,
        };

        self.game.moves.push(move_data);
        self.game.current_fen = self.position.fen().to_string();
        self.last_move_time = move_timestamp;

        self.reset_abandon_timer();
        self.reset_move_timer();

        SocketManager::broadcast(
            self.game.id.clone(),
            messages::Message {
                r#type: messages::MessageType::Move,
                payload: messages::MovePayload {
                    move_payload,
                    player1_time_consumed: self.player1_time_consumed,
                    player2_time_consumed: self.player2_time_consumed,
                },
            },
        );

        if self.chess.is_game_over() {
            let result = if self.chess.is_draw() {
                GameResult::Draw
            } else if self.chess.turn() == shakmaty::Color::Black {
                GameResult::WhiteWins
            } else {
                GameResult::BlackWins
            };

            self.end_game(GameStatus::Completed, result);
        }

        Ok(())
    }

    fn reset_abandon_timer(&mut self) {
        let game_id = self.game.id.clone();
        let timer = std::thread::spawn(move || {
            std::thread::sleep(Duration::from_secs(60));
            let result = if Chess::default().turn() == shakmaty::Color::Black {
                GameResult::WhiteWins
            } else {
                GameResult::BlackWins
            };
            SocketManager::broadcast(
                game_id,
                messages::Message {
                    r#type: messages::MessageType::GameEnded,
                    payload: GameEndedPayload {
                        result,
                        status: GameStatus::Abandoned,
                    },
                },
            );
        });

        let mut timer_lock = self.timer.lock().unwrap();
        *timer_lock = Some(timer);
    }

    fn reset_move_timer(&mut self) {
        let game_id = self.game.id.clone();
        let turn = self.chess.turn();
        let time_left = GAME_TIME_MS
            - if turn == shakmaty::Color::White {
                self.player1_time_consumed
            } else {
                self.player2_time_consumed
            };

        let move_timer = std::thread::spawn(move || {
            std::thread::sleep(Duration::from_millis(time_left));
            let result = if turn == shakmaty::Color::Black {
                GameResult::WhiteWins
            } else {
                GameResult::BlackWins
            };
            SocketManager::broadcast(
                game_id,
                messages::Message {
                    r#type: messages::MessageType::GameEnded,
                    payload: GameEndedPayload {
                        result,
                        status: GameStatus::TimeUp,
                    },
                },
            );
        });

        let mut move_timer_lock = self.move_timer.lock().unwrap();
        *move_timer_lock = Some(move_timer);
    }

    fn end_game(&mut self, status: GameStatus, result: GameResult) {
        self.game.status = status;
        self.game.result = Some(result);

        SocketManager::broadcast(
            self.game.id.clone(),
            messages::Message {
                r#type: messages::MessageType::GameEnded,
                payload: GameEndedPayload { result, status },
            },
        );
    }
}