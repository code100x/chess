use crate::db::models::{Game, GameResult, GameStatus, Move, User};
use crate::messages::{GameEndedPayload, MovePayload};
use crate::socket_manager::SocketManager;
use chrono::{DateTime, Duration, Utc};
use shakmaty::{Chess, Position};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};
use tokio::time::{sleep, timeout};

const GAME_TIME_MS: u64 = 10 * 60 * 60 * 1000; // 10 hours maybe we can change it later

pub struct GameState {
    game: Arc<RwLock<Game>>,
    position: Position,
    chess: Chess,
    player1_time_consumed: Arc<Mutex<u64>>,
    player2_time_consumed: Arc<Mutex<u64>>,
    start_time: DateTime<Utc>,
    last_move_time: Arc<Mutex<DateTime<Utc>>>,
    abandon_timer: Arc<Mutex<Option<tokio::task::JoinHandle<()>>>>,
    move_timer: Arc<Mutex<Option<tokio::task::JoinHandle<()>>>>,
}

impl GameState {
    pub async fn new(game: Game) -> Self {
        let mut chess = Chess::default();
        let position = chess.position();
        let start_time = Utc::now();
        let last_move_time = Arc::new(Mutex::new(start_time));

        GameState {
            game: Arc::new(RwLock::new(game)),
            position,
            chess,
            player1_time_consumed: Arc::new(Mutex::new(0)),
            player2_time_consumed: Arc::new(Mutex::new(0)),
            start_time,
            last_move_time: last_move_time.clone(),
            abandon_timer: Arc::new(Mutex::new(None)),
            move_timer: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn make_move(&mut self, move_payload: MovePayload, user_id: &str) -> Result<(), String> {
        let game = self.game.read().await;

        if (self.chess.turn() == shakmaty::Color::White
            && game.white_player.id != user_id)
            || (self.chess.turn() == shakmaty::Color::Black
                && game.black_player.as_ref().unwrap().id != user_id)
        {
            return Err("Not your turn".to_string());
        }

        if game.result.is_some() {
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

        let time_taken = move_timestamp.timestamp_millis() - self.last_move_time.lock().await.timestamp_millis();

        if self.chess.turn() == shakmaty::Color::Black {
            *self.player1_time_consumed.lock().await += time_taken as u64;
        } else {
            *self.player2_time_consumed.lock().await += time_taken as u64;
        }

        let move_data = Move {
            id: uuid::Uuid::new_v4().to_string(),
            game_id: game.id.clone(),
            move_number: game.moves.len() as u64 + 1,
            from: move_obj.from.to_string(),
            to: move_obj.to.to_string(),
            comments: None,
            start_fen: self.chess.fen().to_string(),
            end_fen: self.position.fen().to_string(),
            time_taken: Some(time_taken as u64),
            created_at: move_timestamp,
        };

        let mut game = self.game.write().await;
        game.moves.push(move_data);
        game.current_fen = self.position.fen().to_string();
        *self.last_move_time.lock().await = move_timestamp;

        self.reset_abandon_timer().await;
        self.reset_move_timer().await;

        SocketManager::broadcast(
            game.id.clone(),
            messages::Message {
                r#type: messages::MessageType::Move,
                payload: messages::MovePayload {
                    move_payload,
                    player1_time_consumed: *self.player1_time_consumed.lock().await,
                    player2_time_consumed: *self.player2_time_consumed.lock().await,
                },
            },
        ).await;

        if self.chess.is_game_over() {
            let result = if self.chess.is_draw() {
                GameResult::Draw
            } else if self.chess.turn() == shakmaty::Color::Black {
                GameResult::WhiteWins
            } else {
                GameResult::BlackWins
            };

            self.end_game(GameStatus::Completed, result).await;
        }

        Ok(())
    }

    async fn reset_abandon_timer(&mut self) {
        let game_id = self.game.read().await.id.clone();
        let abandon_timer = tokio::spawn(async move {
            sleep(Duration::from_secs(60)).await;
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
            ).await;
        });

        let mut abandon_timer_lock = self.abandon_timer.lock().await;
        *abandon_timer_lock = Some(abandon_timer);
    }

    async fn reset_move_timer(&mut self) {
        let game_id = self.game.read().await.id.clone();
        let turn = self.chess.turn();
        let time_left = GAME_TIME_MS
            - if turn == shakmaty::Color::White {
                *self.player1_time_consumed.lock().await
            } else {
                *self.player2_time_consumed.lock().await
            };

        let move_timer = tokio::spawn(async move {
            let result = timeout(Duration::from_millis(time_left), async {
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
                ).await;
            }).await;
        });

        let mut move_timer_lock = self.move_timer.lock().await;
        *move_timer_lock = Some(move_timer);
    }

    async fn end_game(&mut self, status: GameStatus, result: GameResult) {
        let mut game = self.game.write().await;
        game.status = status;
        game.result = Some(result);

        SocketManager::broadcast(
            game.id.clone(),
            messages::Message {
                r#type: messages::MessageType::GameEnded,
                payload: GameEndedPayload { result, status },
            },
        ).await;
   }

}