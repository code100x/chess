use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use tokio::sync::Mutex as AsyncMutex;

pub struct SocketManager {
    sockets: Arc<AsyncMutex<HashMap<usize, mpsc::UnboundedSender<String>>>>,
    room_mappings: Arc<AsyncMutex<HashMap<usize, String>>>,
}

impl SocketManager {
    pub fn new() -> Self {
        SocketManager {
            sockets: Arc::new(AsyncMutex::new(HashMap::new())),
            room_mappings: Arc::new(AsyncMutex::new(HashMap::new())),
        }
    }

    pub async fn broadcast(&self, room_id: String, message: crate::messages::Message) {
        let message_str = serde_json::to_string(&message).unwrap();
        if let Some(sockets) = self.get_room_sockets(&room_id).await {
            for socket in sockets {
                let _ = socket.send(message_str.clone());
            }
        } else {
            println!("No sockets found for room: {}", room_id);
        }
    }

    pub async fn add_socket(&self, socket: mpsc::UnboundedSender<String>, room_id: String) {
        let socket_id = self.get_new_socket_id().await;
        self.sockets.lock().await.insert(socket_id, socket);
        self.room_mappings
            .lock()
            .await
            .insert(socket_id, room_id);
    }

    pub async fn remove_socket(&self, socket_id: usize) {
        if let Some(room_id) = self.room_mappings.lock().await.remove(&socket_id) {
            self.sockets.lock().await.remove(&socket_id);
            self.remove_from_room(socket_id, &room_id).await;
        } else {
            println!("Socket not found: {}", socket_id);
        }
    }

    async fn get_new_socket_id(&self) -> usize {
        let mut rng = rand::thread_rng();
        loop {
            let id = rng.gen::<usize>();
            if !self.sockets.lock().await.contains_key(&id) {
                return id;
            }
        }
    }

    async fn get_room_sockets(&self, room_id: &str) -> Option<Vec<mpsc::UnboundedSender<String>>> {
        let mut sockets = Vec::new();
        let room_mappings = self.room_mappings.lock().await;
        let sockets_map = self.sockets.lock().await;

        for (socket_id, id) in room_mappings.iter() {
            if id == room_id {
                if let Some(socket) = sockets_map.get(socket_id) {
                    sockets.push(socket.clone());
                }
            }
        }

        if sockets.is_empty() {
            None
        } else {
            Some(sockets)
        }
    }

    async fn remove_from_room(&self, socket_id: usize, room_id: &str) {
        if let Some(sockets) = self.get_room_sockets(room_id).await {
            let mut room_mappings = self.room_mappings.lock().await;
            for socket in sockets {
                if socket.id() == socket_id {
                    room_mappings.remove(&socket_id);
                    break;
                }
            }
        }
    }
}