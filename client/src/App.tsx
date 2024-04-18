import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const handleConnect = () => {
    console.log("Connecting to WebSocket server");
    const newSocket = new WebSocket("ws://localhost:3000");
    newSocket.onmessage = handleMessage;
    newSocket.onclose = handleClose;
    setSocket(newSocket);
  };

  const handleDisconnect = () => {
    console.log("Disconnecting from WebSocket server");
    socket?.close();
  };

  const handleClose = () => {
    console.log("Disconnected from WebSocket server");
    setSocket(null);
  };

  const handleMessage = (event: MessageEvent) => {
    console.log("Message received from server:", event.data);
    setMessages((prev) => [...prev, event.data]);
  };

  return (
    <div>
      <h1>WebSocket Client</h1>
      <button onClick={handleConnect}>Connect</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
      <h2>Send a message</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={() => {
          setMessage("");
          socket?.send(message);
        }}
      >
        send
      </button>
    </div>
  );
}
