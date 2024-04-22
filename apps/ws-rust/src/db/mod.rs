use std::sync::Arc;
use tokio::sync::Mutex;

mod models;

pub struct Database {
    data: Arc<Mutex<Vec<models::Game>>>,
}

impl Database {
    pub fn new() -> Self {
        Database {
            data: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn create_game(&self, game: models::Game) {
        self.data.lock().await.push(game);
    }

    pub async fn find_game(&self, game_id: &str) -> Option<models::Game> {
        self.data
            .lock()
            .await
            .iter()
            .find(|game| game.id == game_id)
            .cloned()
    }

    pub async fn update_game(&self, game: models::Game) {
        let mut data = self.data.lock().await;
        if let Some(index) = data.iter().position(|g| g.id == game.id) {
            data[index] = game;
        }
    }
}