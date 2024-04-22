use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: String,
    pub white_player: User,
    pub black_player: Option<User>,
    pub start_time: DateTime<Utc>,
    pub moves: Vec<Move>,
    pub current_fen: String,
    pub status: GameStatus,
    pub result: Option<GameResult>,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Move {
    pub id: String,
    pub game_id: String,
    pub move_number: u64,
    pub from: String,
    pub to: String,
    pub comments: Option<String>,
    pub start_fen: String,
    pub end_fen: String,
    pub time_taken: Option<u64>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GameStatus {
    InProgress,
    Completed,
    Abandoned,
    TimeUp,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum GameResult {
    WhiteWins,
    BlackWins,
    Draw,
}