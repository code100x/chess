use tokio::net::TcpListener;
use tokio_tungstenite::{accept_async, tungstenite::protocol::Message};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use url::Url;

mod auth;
mod db;
mod game;
mod messages;
mod socket_manager;

use auth::extract_user_id;
use game::game_manager::GameManager;
use socket_manager::SocketManager;
use game::User;
use messages::parse_message;

struct Server {
    game_manager: Arc<Mutex<GameManager>>,
    socket_manager: Arc<Mutex<SocketManager>>,
    users: Arc<Mutex<HashMap<usize, User>>>,
}

#[tokio::main]
async fn main() {
    let game_manager = Arc::new(Mutex::new(GameManager::new()));
    let socket_manager = Arc::new(Mutex::new(SocketManager::new()));
    let users = Arc::new(Mutex::new(HashMap::new()));

    let server = Arc::new(Server {
        game_manager,
        socket_manager,
        users,
    });

    let addr = "127.0.0.1:8080";
    let listener = TcpListener::bind(addr).await.expect("Failed to bind");
    println!("Listening on: {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        let server = server.clone();
        tokio::spawn(async move {
            if let Err(e) = handle_connection(stream, server).await {
                eprintln!("Error handling connection: {:?}", e);
            }
        });
    }
}

async fn handle_connection(stream: tokio::net::TcpStream, server: Arc<Server>) -> Result<(), Box<dyn std::error::Error>> {
    let ws_stream = accept_async(stream).await.expect("Failed to accept connection");
    let (write, mut read) = ws_stream.split();

    while let Some(message) = read.next().await {
        match message? {
            Message::Text(text) => {
                let message = parse_message(&text);
                // Logic to handle the message
                println!("Received message: {:?}", message);
            },
            Message::Binary(_) => println!("Received binary data"),
            Message::Close(_) => {
                println!("Client disconnected");
                break;
            }
            _ => {}
        }
    }

    Ok(())
}
