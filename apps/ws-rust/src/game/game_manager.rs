use crate::db::{Database, models};
use crate::game::GameState;
use crate::messages::{
    GameJoinedPayload, InitGamePayload, JoinRoomPayload, MessagePayload, MessageType,
};
use crate::socket_manager::SocketManager;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};

pub struct User {
    pub id: usize,
    pub user_id: String,
    pub sender: Sender,
}

impl User {
    pub fn new(sender: Sender, user_id: String) -> Self {
        User {
            id: rand::thread_rng().gen::<usize>(),
            user_id,
            sender,
        }
    }
}

pub struct GameManager {
    games: HashMap<String, GameState>,
    pending_game_id: Option<String>,
    database: Database,
}

impl GameManager {
    pub async fn new(database: Database) -> Self {
        GameManager {
            games: HashMap::new(),
            pending_game_id: None,
            database,
        }
    }

    pub async fn init_game(&mut self, payload: MessagePayload) {
        if let Some(pending_game_id) = self.pending_game_id.take() {
            if let Some(game) = self.games.get_mut(&pending_game_id) {
                if let InitGamePayload::JoinGame(user_id) = payload {
                    let game_lock = game.game.read().await;
                    if user_id == game_lock.white_player.id {
                        SocketManager::broadcast(
                            pending_game_id.clone(),
                            messages::Message {
                                r#type: messages::MessageType::GameAlert,
                                payload: "Trying to Connect with yourself?".to_string(),
                            },
                        )
                        .await;
                        return;
                    }

                    let mut game_lock = game.game.write().await;
                    game_lock.black_player = Some(models::User {
                        id: user_id.clone(),
                        name: "".to_string(),
                    });

                    self.database.create_game(game_lock.clone()).await;

                    SocketManager::broadcast(
                        pending_game_id.clone(),
                        messages::Message {
                            r#type: messages::MessageType::InitGame,
                            payload: InitGamePayload::GameInitialized {
                                game_id: pending_game_id.clone(),
                                white_player: game_lock.white_player.clone(),
                                black_player: game_lock.black_player.clone(),
                                fen: game.chess.fen().to_string(),
                                moves: vec![],
                            },
                        },
                    )
                    .await;
                }
            }
        } else {
            if let InitGamePayload::CreateGame(user_id) = payload {
                let white_player = models::User {
                    id: user_id.clone(),
                    name: "".to_string(),
                };
                let game = GameState::new(models::Game {
                    id: uuid::Uuid::new_v4().to_string(),
                    white_player,
                    black_player: None,
                    start_time: Utc::now(),
                    moves: vec![],
                    current_fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                        .to_string(),
                    status: GameStatus::InProgress,
                    result: None,
                })
                .await;

                let game_id = game.game.read().await.id.clone();
                self.games.insert(game_id.clone(), game);
                self.pending_game_id = Some(game_id);

                SocketManager::broadcast(
                    game_id,
                    messages::Message {
                        r#type: messages::MessageType::GameAdded,
                        payload: MessagePayload::None,
                    },
                )
                .await;
            }
        }
    }

    pub async fn make_move(&mut self, payload: MessagePayload) {
        if let MessagePayload::MovePayload(move_payload) = payload {
            if let Some(game) = self.games.get_mut(&move_payload.game_id) {
                if let Err(err) = game.make_move(move_payload, &move_payload.user_id).await {
                    SocketManager::broadcast(
                        move_payload.game_id.clone(),
                        messages::Message {
                            r#type: messages::MessageType::GameAlert,
                            payload: err,
                        },
                    )
                    .await;
                }
            }
        }
    }

    pub async fn join_room(&mut self, payload: JoinRoomPayload) {
        let game_id = payload.game_id.unwrap();

        if let Some(mut game) = self.games.remove(&game_id) {
            SocketManager::broadcast(
                game_id.clone(),
                messages::Message {
                    r#type: messages::MessageType::GameJoined,
                    payload: GameJoinedPayload {
                        game_id: game_id.clone(),
                        moves: game.game.read().await.moves.clone(),
                        black_player: game.game.read().await.black_player.clone(),
                        white_player: game.game.read().await.white_player.clone(),
                        player1_time_consumed: *game.player1_time_consumed.lock().await,
                        player2_time_consumed: *game.player2_time_consumed.lock().await,
                    },
                },
            )
            .await;

            self.games.insert(game_id, game);
        } else {
            if let Some(game) = self.database.find_game(&game_id).await {
                let game_state = GameState::new(game.clone()).await;
                self.games.insert(game_id.clone(), game_state);

                SocketManager::broadcast(
                    game_id.clone(),
                    messages::Message {
                        r#type: messages::MessageType::GameJoined,
                        payload: GameJoinedPayload {
                            game_id: game_id.clone(),
                            moves: game.moves.clone(),
                            black_player: game.black_player.clone(),
                            white_player: game.white_player.clone(),
                            player1_time_consumed: 0,
                            player2_time_consumed: 0,
                        },
                    },
                )
                .await;
            } else {
                SocketManager::broadcast(
                    game_id,
                    messages::Message {
                        r#type: messages::MessageType::GameNotFound,
                        payload: MessagePayload::None,
                    },
                )
                .await;
            }
        }
    }
}