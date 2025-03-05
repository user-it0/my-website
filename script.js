document.addEventListener("DOMContentLoaded", function() {
    // グローバル変数
    let currentUser = null;
    let approvedFriends = [];
    let sentRequests = [];
    let pendingRequests = []; // 受信した友達リクエスト
  
    // ユーザー検索用のダミーデータ
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
    const friendRequestsList = document.getElementById("friend-requests-list");
    const simulateRequestBtn = document.getElementById("simulate-request");
    const contactListUl = document.getElementById("contact-list");
  
    const pageChat = document.getElementById("page-chat");
    const backToHomeBtn = document.getElementById("back-to-home");
    const messageHistory = document.getElementById("message-history");
    const chatInput = document.getElementById("chat-input");
    const sendMessageBtn = document.getElementById("send-message");
  
    /* --- フォーム切替 --- */
    toRegistrationBtn.addEventListener("click", function() {
      loginDiv.style.display = "none";
      registrationDiv.style.display = "block";
    });
    toLoginBtn.addEventListener("click", function() {
      registrationDiv.style.display = "none";
      loginDiv.style.display = "block";
    });
  
    /* --- ユーザー登録／ログイン --- */
    registrationForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const username = document.getElementById("register-username").value.trim();
      const password = document.getElementById("register-password").value;
      // 通常はサーバーでユーザー登録する処理
      currentUser = { username, password };
      alert("登録完了: " + username);
      showHomePage();
    });
  
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value;
      // 通常はサーバー側で認証処理を実施
      currentUser = { username, password };
      alert("ログイン成功: " + username);
      showHomePage();
    });
  
    /* --- ホーム画面表示 --- */
    function showHomePage() {
      displayUsername.value = currentUser.username;
      pageAuth.style.display = "none";
      pageHome.style.display = "block";
      pageChat.style.display = "none";
      renderContactList();
      renderFriendRequests();
    }
  
    /* --- 連絡可能ユーザーリストのレンダリング --- */
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
  
    /* --- 友達リクエスト（受信）のレンダリング --- */
    function renderFriendRequests() {
      friendRequestsList.innerHTML = "";
      pendingRequests.forEach((request, index) => {
        const li = document.createElement("li");
        li.className = "contact-item";
        li.textContent = request;
        
        // 承認ボタン
        const approveBtn = document.createElement("button");
        approveBtn.textContent = "承認";
        approveBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          approvedFriends.push(request);
          pendingRequests.splice(index, 1);
          alert(request + " を承認しました。");
          renderFriendRequests();
          renderContactList();
        });
        
        // 拒否ボタン
        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "拒否";
        rejectBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          pendingRequests.splice(index, 1);
          alert(request + " のリクエストを拒否しました。");
          renderFriendRequests();
        });
        
        li.appendChild(approveBtn);
        li.appendChild(rejectBtn);
        friendRequestsList.appendChild(li);
      });
    }
  
    /* --- ユーザー検索 --- */
    userSearchInput.addEventListener("input", function() {
      const query = this.value.trim().toLowerCase();
      searchResultUl.innerHTML = "";
      if(query === "") return;
      // currentUserは検索結果から除外
      const results = dummyUsers.filter(u => 
        u.toLowerCase().includes(query) && u !== currentUser.username
      );
      results.forEach(user => {
        const li = document.createElement("li");
        li.textContent = user;
        li.className = "contact-item";
        li.addEventListener("click", function() {
          // 送信済み、または既に友達の場合は重複しないように
          if(approvedFriends.includes(user)) {
            alert(user + " は既に連絡可能リストに追加されています。");
          } else if(sentRequests.includes(user)) {
            alert(user + " へのリクエストは既に送信済みです。");
          } else {
            sentRequests.push(user);
            alert(user + " に友達追加リクエストを送信しました。");
            // ※ここでは送信側のリクエスト処理のみを実施
          }
        });
        searchResultUl.appendChild(li);
      });
    });
  
    /* --- シミュレーション：受信した友達リクエスト --- */
    simulateRequestBtn.addEventListener("click", function() {
      // dummyUsersから、既に自分、承認済み、送信済み、受信済み以外のユーザーをランダムに選択
      const candidates = dummyUsers.filter(u => 
        u !== currentUser.username &&
        !approvedFriends.includes(u) &&
        !pendingRequests.includes(u) &&
        !sentRequests.includes(u)
      );
      if(candidates.length === 0) {
        alert("新たなリクエストはありません。");
        return;
      }
      const randomUser = candidates[Math.floor(Math.random() * candidates.length)];
      pendingRequests.push(randomUser);
      alert(randomUser + " から友達リクエストが届きました。");
      renderFriendRequests();
    });
  
    /* --- チャット画面を開く --- */
    function openChat(friend) {
      pageHome.style.display = "none";
      pageChat.style.display = "block";
      messageHistory.innerHTML = "";
      const welcome = document.createElement("div");
      welcome.textContent = "チャット開始: " + friend;
      messageHistory.appendChild(welcome);
    }
  
    /* --- ホーム画面へ戻る --- */
    backToHomeBtn.addEventListener("click", function() {
      pageChat.style.display = "none";
      pageHome.style.display = "block";
    });
  
    /* --- チャット送信 --- */
    sendMessageBtn.addEventListener("click", function() {
      const msg = chatInput.value.trim();
      if(msg === "") return;
      const div = document.createElement("div");
      div.textContent = "【自分】 " + msg;
      messageHistory.appendChild(div);
      chatInput.value = "";
      messageHistory.scrollTop = messageHistory.scrollHeight;
    });
  });  