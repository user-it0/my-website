const socket = io();
let currentUser = null;
let currentChatUser = null;

// ログイン処理
document.getElementById("login-btn").addEventListener("click", function() {
  currentUser = document.getElementById("username").value.trim();
  if (currentUser === "") return alert("ユーザー名を入力してください");
  socket.emit("login", currentUser);
  document.getElementById("auth-page").style.display = "none";
  document.getElementById("home-page").style.display = "block";
  document.getElementById("current-user").textContent = currentUser;
});

// 友達検索
document.getElementById("search-user").addEventListener("input", function() {
  const query = this.value.trim();
  socket.emit("search-user", query);
});

// 検索結果受信
socket.on("search-results", users => {
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";
  users.forEach(user => {
    if (user !== currentUser) {
      const li = document.createElement("li");
      li.textContent = user;
      li.addEventListener("click", function() {
        socket.emit("add-friend", { from: currentUser, to: user });
      });
      userList.appendChild(li);
    }
  });
});

// 友達リスト受信
socket.on("update-friends", friends => {
  const friendList = document.getElementById("friend-list");
  friendList.innerHTML = "";
  friends.forEach(friend => {
    const li = document.createElement("li");
    li.textContent = friend;
    li.addEventListener("click", function() {
      startChat(friend);
    });
    friendList.appendChild(li);
  });
});

// チャット開始
function startChat(friend) {
  currentChatUser = friend;
  document.getElementById("home-page").style.display = "none";
  document.getElementById("chat-page").style.display = "block";
  document.getElementById("chat-user").textContent = friend;
  socket.emit("load-messages", { user1: currentUser, user2: friend });
}

// メッセージ送信
document.getElementById("send-btn").addEventListener("click", function() {
  const message = document.getElementById("message-input").value.trim();
  if (message !== "") {
    socket.emit("send-message", { from: currentUser, to: currentChatUser, message });
    document.getElementById("message-input").value = "";
  }
});

// 受信メッセージ表示
socket.on("receive-message", ({ from, message }) => {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = `${from}: ${message}`;
  document.getElementById("messages").appendChild(msgDiv);
});

// 戻るボタン
document.getElementById("back-btn").addEventListener("click", function() {
  document.getElementById("chat-page").style.display = "none";
  document.getElementById("home-page").style.display = "block";
});
