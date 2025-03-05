document.addEventListener("DOMContentLoaded", function() {
    // Socket.IO 接続（サーバー側：server.js の socket.io に接続）
    const socket = io();
  
    // グローバル変数
    let currentUser = null;
    let approvedFriends = [];
    let incomingRequests = [];
    let currentRoom = null; // 現在チャット中のルーム
  
    // ユーザー検索用のダミーデータ（実際はサーバーから取得）
    const dummyUsers = ["Alice", "Bob", "Charlie", "David", "Eve"];
  
    // 要素取得
    const pageAuth = document.getElementById("page-auth");
    const loginForm = document.getElementById("form-login");
    const registrationForm = document.getElementById("form-register");
    const loginDiv = document.getElementById("login-form");
    const registrationDiv = document.getElementById("registration-form");
    const toRegistrationBtn = document.getElementById("to-registration");
    const toLoginBtn = document.getElementById("to-login");
  
    const pageHome = document.getElementById("page-home");
    const displayUsername = document.getElementById("display-username");
    const userSearchInput = document.getElementById("user-search");
    const searchResultUl = document.getElementById("search-result");
    const contactListUl = document.getElementById("contact-list");
    const requestListUl = document.getElementById("request-list");
  
    const pageChat = document.getElementById("page-chat");
    const backToHomeBtn = document.getElementById("back-to-home");
    const messageHistory = document.getElementById("message-history");
    const chatInput = document.getElementById("chat-input");
    const sendMessageBtn = document.getElementById("send-message");
  
    // フォーム切替
    toRegistrationBtn.addEventListener("click", function() {
      loginDiv.style.display = "none";
      registrationDiv.style.display = "block";
    });
    toLoginBtn.addEventListener("click", function() {
      registrationDiv.style.display = "none";
      loginDiv.style.display = "block";
    });
  
    // 登録フォーム送信
    registrationForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const username = document.getElementById("register-username").value;
      const password = document.getElementById("register-password").value;
      // 本来はサーバーでユーザー登録する処理を実装
      currentUser = { username, password };
      alert("登録完了: " + username);
      // ダミーの受信リクエスト例
      incomingRequests = ["Alice", "Bob"];
      showHomePage();
    });
  
    // ログインフォーム送信
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;
      // 本来はサーバー側で認証処理を実施
      currentUser = { username, password };
      alert("ログイン成功: " + username);
      incomingRequests = ["Charlie"];
      showHomePage();
    });
  
    // ホーム画面表示
    function showHomePage() {
      displayUsername.value = currentUser.username;
      pageAuth.style.display = "none";
      pageHome.style.display = "block";
      pageChat.style.display = "none";
      renderContactList();
      renderRequestList();
    }
  
    // 承認済みユーザーリストのレンダリング
    function renderContactList() {
      contactListUl.innerHTML = "";
      approvedFriends.forEach(friend => {
        const li = document.createElement("li");
        li.textContent = friend;
        li.className = "contact-item";
        li.addEventListener("click", function() {
           openChat(friend);
        });
        contactListUl.appendChild(li);
      });
    }
  
    // 友達リクエスト一覧のレンダリング
    function renderRequestList() {
      requestListUl.innerHTML = "";
      incomingRequests.forEach(requestUser => {
        const li = document.createElement("li");
        li.className = "contact-item";
        // ユーザー名とアクションボタン
        const span = document.createElement("span");
        span.textContent = requestUser;
        li.appendChild(span);
        // 承認ボタン
        const acceptBtn = document.createElement("button");
        acceptBtn.textContent = "承認";
        acceptBtn.style.marginLeft = "10px";
        acceptBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          approvedFriends.push(requestUser);
          incomingRequests = incomingRequests.filter(user => user !== requestUser);
          alert(requestUser + " のリクエストを承認しました。");
          renderRequestList();
          renderContactList();
        });
        li.appendChild(acceptBtn);
        // 拒否ボタン
        const declineBtn = document.createElement("button");
        declineBtn.textContent = "拒否";
        declineBtn.style.marginLeft = "5px";
        declineBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          incomingRequests = incomingRequests.filter(user => user !== requestUser);
          alert(requestUser + " のリクエストを拒否しました。");
          renderRequestList();
        });
        li.appendChild(declineBtn);
  
        requestListUl.appendChild(li);
      });
    }
  
    // ユーザー検索機能
    userSearchInput.addEventListener("input", function() {
      const query = this.value.trim().toLowerCase();
      searchResultUl.innerHTML = "";
      if(query === "") return;
      // 現在のユーザーは除外
      const results = dummyUsers.filter(u => 
        u.toLowerCase().includes(query) && u !== currentUser.username
      );
      results.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        li.className = "contact-item";
        li.addEventListener("click", function() {
          // 友達追加リクエスト送信（実際はサーバー経由の処理に置換）
          if(approvedFriends.includes(user)) {
            alert(user + " は既に連絡可能リストに追加されています。");
          } else {
            alert(user + " に友達追加リクエストを送信しました。");
            // ※送信後、相手側にリクエストが届く想定
          }
        });
        searchResultUl.appendChild(li);
      });
    });
  
    // チャット画面を開く（1対1チャットのルームに参加）
    function openChat(friend) {
      // ルーム名は両ユーザー名を昇順に連結して生成
      currentRoom = [currentUser.username, friend].sort().join("_");
      socket.emit("joinRoom", currentRoom);
  
      pageHome.style.display = "none";
      pageChat.style.display = "block";
      messageHistory.innerHTML = "";
      // ルーム参加時のウェルカムメッセージ（各自で初回のみ表示）
      const welcome = document.createElement("div");
      welcome.textContent = "チャット開始 (" + friend + ")";
      messageHistory.appendChild(welcome);
    }
  
    // ホーム画面へ戻る
    backToHomeBtn.addEventListener("click", function() {
      pageChat.style.display = "none";
      pageHome.style.display = "block";
    });
  
    // チャット送信処理
    sendMessageBtn.addEventListener("click", function() {
      const msg = chatInput.value.trim();
      if(msg === "") return;
      // メッセージ送信：サーバーへ送信し、同ルーム内の他クライアントへ配信
      const data = { room: currentRoom, sender: currentUser.username, message: msg };
      socket.emit("chatMessage", data);
      chatInput.value = "";
    });
  
    // サーバーからのチャットメッセージ受信
    socket.on("chatMessage", data => {
      // data: {room, sender, message}
      // ルーム名が一致する場合のみ表示
      if(data.room === currentRoom) {
        const div = document.createElement("div");
        div.textContent = "【" + data.sender + "】 " + data.message;
        messageHistory.appendChild(div);
        messageHistory.scrollTop = messageHistory.scrollHeight;
      }
    });
  });  