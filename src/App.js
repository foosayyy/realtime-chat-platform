import { useState, useEffect } from "react";
import { socket } from "./socket";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [avatar, setAvatar] = useState("😀");
  const [typingUser, setTypingUser] = useState("");

  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", {
        room: room,
        username: username,
        avatar: avatar,
      });

      setJoined(true);
    }
  };

  const sendMessage = () => {
    const msg = {
      id: uuidv4(),
      room: room,
      username: username,
      avatar: avatar,
      message: message,
    };

    socket.emit("send_message", msg);
    setMessage("");
  };

  useEffect(() => {
    const handleMessage = (data) => {
      setMessages((list) => [...list, data]);
    };

    socket.on("receive_message", handleMessage);

    socket.on("user_typing", (name) => {
      setTypingUser(name);

      setTimeout(() => {
        setTypingUser("");
      }, 1500);
    });

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, []);

  return (
    <div className="app">
      {!joined ? (
        <div className="join">
          <h2>Join Chat Room</h2>

          <input
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="room key"
            onChange={(e) => setRoom(e.target.value)}
          />

          <select onChange={(e) => setAvatar(e.target.value)}>
            <option value="😀">😀</option>
            <option value="😎">😎</option>
            <option value="🤖">🤖</option>
            <option value="🐱">🐱</option>
            <option value="🐸">🐸</option>
          </select>

          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="chat">
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className="msg">
                <span>{msg.avatar}</span> <b>{msg.username}</b>: {msg.message}
              </div>
            ))}
          </div>
          {typingUser && (
            <div style={{ color: "#aaa", padding: "5px 20px" }}>
              {typingUser} is typing...
            </div>
          )}
          <div className="input">
            <input
              value={message}
              placeholder="message..."
              onChange={(e) => {
                setMessage(e.target.value);

                socket.emit("typing", {
                  room: room,
                  username: username,
                });
              }}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
