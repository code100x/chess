// Import external crates
use ws::{listen, Handler, Message, Sender, CloseCode};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use url::Url;

// Import modules from the project
use auth::extract_user_id;
use game::game_manager::GameManager;
use socket_manager::SocketManager;

// Import modules relative to the current file
mod auth;
mod db;
mod game;
mod messages;
mod socket_manager;

struct Server {
    game_manager: Arc<Mutex<GameManager>>,
    socket_manager: Arc<Mutex<SocketManager>>,
    users: Arc<Mutex<HashMap<usize, User>>>,
}

impl Handler for Server {
    fn on_message(&mut self, msg: Message) -> Result<(), ws::Error> {
        let data = msg.as_text()?;
        let message = messages::parse_message(&data);

        match message.r#type {
            messages::MessageType::InitGame => {
                if let Some(payload) = message.payload {
                    self.game_manager.lock().unwrap().init_game(payload);
                } else {
                    println!("Error: Missing payload for InitGame message");
                }
            }
            messages::MessageType::Move => {
                if let Some(payload) = message.payload {
                    self.game_manager.lock().unwrap().make_move(payload);
                } else {
                  println!("Error: Missing payload for Move message");
                }
            }
            messages::MessageType::JoinRoom => {
                if let Some(payload) = message.payload {
                    self.game_manager.lock().unwrap().join_room(payload);
                } else {
                   println!("Error: Missing payload for JoinRoom message");
                }
            }
        }

        Ok(())
    }

    fn on_open(&mut self, sender: Sender, req: ws::Request) -> Result<(), ws::Error> {
        let url = Url::parse(&format!("http://server{}", req.resource())).unwrap();
        let token = url.query_pairs().find(|(key, _)| key == "token").map(|(_, value)| value.to_string());
        let user_id = match token {
            Some(token) => extract_user_id(token),
            None => return Err(ws::Error::new(ws::ErrorKind::Internal, "Missing token")),
        };

        let user = User::new(sender, user_id);
        self.users.lock().unwrap().insert(user.id, user);
        Ok(())
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        //  close event handling    here 
    }
}

fn main() {
    let game_manager = Arc::new(Mutex::new(GameManager::new()));
    let socket_manager = Arc::new(Mutex::new(SocketManager::new()));
    let users = Arc::new(Mutex::new(HashMap::new()));

    let server = Server {
        game_manager: game_manager.clone(),
        socket_manager: socket_manager.clone(),
        users: users.clone(),
    };

    listen("127.0.0.1:8080", |out| {
        
        server.on_open(out.unwrap_or_else(|_| panic!("Failed to unwrap out")), Default::default())
            .map(|_| server.clone()) //  map to return the server instance
    }).unwrap()
}
