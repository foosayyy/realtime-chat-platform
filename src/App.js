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
  const [users, setUsers] = useState([]);

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
    if (message.trim() === "") return;

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

    socket.on("room_users", (userList) => {
      setUsers(userList);
    });

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

          <div className="avatar-picker">
            {["😀", "😎", "🤖", "🐱", "🐸", "🐼", "👽"].map((a) => (
              <div
                key={a}
                className={`avatar ${avatar === a ? "selected" : ""}`}
                onClick={() => setAvatar(a)}
              >
                {a}
              </div>
            ))}
          </div>

          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="chat">
          <div className="sidebar">
            <h3>Online</h3>

            {users.map((user, i) => (
              <div key={i} className="user">
                <span className="user-avatar">{user.avatar}</span>
                <span className="user-name">{user.username}</span>
              </div>
            ))}
          </div>

          <div className="chat-main">
            <div className="messages">
              {messages.map((msg) => (
                <div key={msg.id} className="msg">
                  <div className="avatar-bubble">{msg.avatar}</div>

                  <div className="msg-content">
                    <div className="msg-user">{msg.username}</div>
                    <div className="msg-text">{msg.message}</div>
                  </div>
                </div>
              ))}
            </div>

            {typingUser && (
              <div className="typing">{typingUser} is typing...</div>
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />

              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
