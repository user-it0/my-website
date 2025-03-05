console.log('Server.js is being executed');

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// public フォルダにあるファイル（index.html など）を配信
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("新しいクライアント接続:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("chatMessage", (data) => {
    // 受け取ったルームへメッセージを送信
    io.to(data.room).emit("chatMessage", data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});