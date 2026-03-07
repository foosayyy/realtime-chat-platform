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

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join_room", (data) => {
    socket.join(data.room);

    socket.username = data.username;
    socket.room = data.room;

    if (!rooms[data.room]) {
      rooms[data.room] = [];
    }

    rooms[data.room].push({
      username: data.username,
      avatar: data.avatar,
    });

    io.to(data.room).emit("receive_message", {
      id: Date.now(),
      username: "System",
      avatar: "⚡",
      message: `${data.username} joined the room`,
    });

    io.to(data.room).emit("room_users", rooms[data.room]);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("user_typing", data.username);
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    const username = socket.username;

    if (room && rooms[room]) {
      rooms[room] = rooms[room].filter((user) => user.username !== username);

      io.to(room).emit("room_users", rooms[room]);

      io.to(room).emit("receive_message", {
        id: Date.now(),
        username: "System",
        avatar: "⚡",
        message: `${username} left the room`,
      });
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
