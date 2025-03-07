const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 静的ファイルの提供
app.use(express.static(__dirname + "/public"));

// テスト用のルート（アクセス確認）
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  console.log("ユーザーが接続しました");

  socket.on("disconnect", () => {
    console.log("ユーザーが切断しました");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました`);
});