use ws::Sender;
use std::collections::HashMap;

pub struct SocketManager {
    sockets: HashMap<usize, Sender>,
    room_mappings: HashMap<usize, String>,
}

impl SocketManager {
    pub fn new() -> Self {
        SocketManager {
            sockets: HashMap::new(),
            room_mappings: HashMap::new(),
        }
    }

    pub fn broadcast(&self, room_id: String, message: crate::messages::Message) {
        let message_str = serde_json::to_string(&message).unwrap();

        if let Some(sockets) = self.get_room_sockets(&room_id) {
            for socket in sockets {
                socket.send(message_str.clone()).unwrap();
            }
        } else {
            println!("No sockets found for room: {}", room_id);
        }
    }

    pub fn add_socket(&mut self, socket: Sender, room_id: String) {
        let socket_id = self.get_new_socket_id();
        self.sockets.insert(socket_id, socket);
        self.room_mappings.insert(socket_id, room_id);
    }

    pub fn remove_socket(&mut self, socket_id: usize) {
        if let Some(room_id) = self.room_mappings.remove(&socket_id) {
            self.sockets.remove(&socket_id);
            self.remove_from_room(socket_id, &room_id);
        } else {
            println!("Socket not found: {}", socket_id);
        }
    }

    fn get_new_socket_id(&self) -> usize {
        let mut rng = rand::thread_rng();
        loop {
            let id = rng.gen::<usize>();
            if !self.sockets.contains_key(&id) {
                return id;
            }
        }
    }

    fn get_room_sockets(&self, room_id: &str) -> Option<Vec<&Sender>> {
        let mut sockets = Vec::new();
        for (socket_id, id) in &self.room_mappings {
            if id == room_id {
                if let Some(socket) = self.sockets.get(socket_id) {
                    sockets.push(socket);
                }
            }
        }
        if sockets.is_empty() {
            None
        } else {
            Some(sockets)
        }
    }

    fn remove_from_room(&mut self, socket_id: usize, room_id: &str) {
        if let Some(sockets) = self.get_room_sockets(room_id) {
            for socket in sockets {
                if socket.id() == socket_id {
                    self.room_mappings.remove(&socket_id);
                    break;
                }
            }
        }
    }
}