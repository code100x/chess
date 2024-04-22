use crate::game::Move;
use crate::game::{User, GameResult, GameStatus};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "payload")]
pub enum Message {
    InitGame(InitGamePayload),
    Move(MovePayload),
    GameOver,
    JoinGame,
    OpponentDisconnected,
    JoinRoom(JoinRoomPayload),
    GameNotFound(MessagePayload),
    GameJoined(GameJoinedPayload),
    GameEnded(GameEndedPayload),
    GameAlert(String),
    GameAdded(MessagePayload),
    GameTime,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(untagged)]
pub enum InitGamePayload {
    CreateGame(String),
    JoinGame(String),
    GameInitialized {
        game_id: String,
        white_player: User,
        black_player: Option<User>,
        fen: String,
        moves: Vec<Move>,
    },
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MovePayload {
    pub game_id: String,
    pub user_id: String,
    pub from: String,
    pub to: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct JoinRoomPayload {
    pub game_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum MessagePayload {
    None,
    MovePayload(MovePayload),
    JoinRoomPayload(JoinRoomPayload),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GameJoinedPayload {
    pub game_id: String,
    pub moves: Vec<Move>,
    pub black_player: Option<User>,
    pub white_player: User,
    pub player1_time_consumed: u64,
    pub player2_time_consumed: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GameEndedPayload {
    pub result: GameResult,
    pub status: GameStatus,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub enum MessageType {
    InitGame,
    Move,
    GameOver,
    JoinGame,
    OpponentDisconnected,
    JoinRoom,
    GameNotFound,
    GameJoined,
    GameEnded,
    GameAlert,
    GameAdded,
    GameTime,
}

pub fn parse_message(data: &str) -> Message {
    serde_json::from_str(data).unwrap_or_else(|_| Message::GameAlert("Invalid message format".to_string()))
}
