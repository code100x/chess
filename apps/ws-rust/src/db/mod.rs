use std::sync::Mutex;

mod models;

pub struct Database {
    data: Mutex<Vec<models::Game>>,
}

impl Database {
    pub fn new() -> Self {
        Database {
            data: Mutex::new(Vec::new()),
        }
    }

    pub fn create_game(&self, game: models::Game) {
        self.data.lock().unwrap().push(game);
    }

    pub fn find_game(&self, game_id: &str) -> Option<models::Game> {
        self.data
            .lock()
            .unwrap()
            .iter()
            .find(|game| game.id == game_id)
            .cloned()
    }

    pub fn update_game(&self, game: models::Game) {
        let mut data = self.data.lock().unwrap();
        if let Some(index) = data.iter().position(|g| g.id == game.id) {
            data[index] = game;
        }
    }
}