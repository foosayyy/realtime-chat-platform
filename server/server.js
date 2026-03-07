const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join_room", (data) => {
    socket.join(data.room);

    socket.to(data.room).emit("receive_message", {
      id: Date.now(),
      username: "System",
      avatar: "⚡",
      message: data.username + " joined the room",
    });
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });
});

socket.on("typing", (data) => {
  socket.to(data.room).emit("user_typing", data.username);
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
