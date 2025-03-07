const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect("mongodb://localhost/chat-app", { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model("User", new mongoose.Schema({ username: String, friends: [String] }));
const Message = mongoose.model("Message", new mongoose.Schema({ from: String, to: String, message: String }));

const users = {};

io.on("connection", socket => {
  socket.on("login", async username => {
    users[username] = socket.id;
    let user = await User.findOne({ username });
    if (!user) user = await User.create({ username, friends: [] });
    socket.emit("update-friends", user.friends);
  });

  socket.on("search-user", async query => {
    const users = await User.find({ username: new RegExp(query, "i") }).limit(10);
    socket.emit("search-results", users.map(u => u.username));
  });

  socket.on("send-message", async data => {
    await Message.create(data);
    io.to(users[data.to]).emit("receive-message", data);
  });

  socket.on("load-messages", async ({ user1, user2 }) => {
    const messages = await Message.find({ $or: [{ from: user1, to: user2 }, { from: user2, to: user1 }] });
    messages.forEach(m => socket.emit("receive-message", m));
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));