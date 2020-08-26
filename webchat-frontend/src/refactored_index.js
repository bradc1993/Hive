const BASE_URL = "http://localhost:3000"
const USERS_URL = `${BASE_URL}/users`
const CHANNELS_URL = `${BASE_URL}/channels`
const MESSAGES_URL = `${BASE_URL}/messages`

let currentUser;
let currentChannel;

document.addEventListener("DOMContentLoaded", () => {
  function openConnection() {
    return new WebSocket("ws://localhost:3000/cable")
  }

  const chatWebSocket = openConnection()
  chatWebSocket.onopen = (event) => {
    const subscribeMsg = { "command": "subscribe", "identifier": "{\"channel\":\"ChatMessagesChannel\"}" }
    chatWebSocket.send(JSON.stringify(subscribeMsg))
  };

  // const userWebSocket = openConnection()
  // userWebSocket.onopen = (event) => {
  //   const subscribeUser = { "command": "subscribe", "identifier": "{\"channel\":\"UsersOnlineChannel\"}" }
  //   userWebSocket.send(JSON.stringify(subscribeUser))
  // };

  liveChatSocket(chatWebSocket);
  //liveUserSocket(userWebSocket);

  const loginForm = document.querySelector('#login-form')
  function logIn(users) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let nameInput = event.target.name.value;
      let returnArray = users.filter(user => user.username == nameInput);
      if (returnArray.length > 0) {
        currentUser = returnArray[0];
        console.log(currentUser)
        fetch(MESSAGES_URL).then(res => res.json()).then(messages => renderChatHistory(messages));
        fetch(CHANNELS_URL).then(res => res.json()).then(channels => renderChannelList(channels));
        renderHomePage(currentUser);
      } else {
        alert('User not found. Please try again')
      }
    })
  };

  const sendBtn = document.querySelector('#send-btn')
  sendBtn.onclick = () => {
    event.preventDefault()

    const chatField = document.querySelector("#chat-field")

    const msg = {
      "command": "message",
      "identifier": "{\"channel\":\"ChatMessagesChannel\"}",
      "data": `{
        \"action\": \"send_text\",
        \"content\": \"${chatField.value}\",
        \"username\": \"${currentUser.username}\",
        \"user_id\": \"${currentUser.id}\",
        \"channel_id\": \"${currentChannel.id}\"
      }`
    }

    console.log(msg)

    chatWebSocket.send(JSON.stringify(msg))
    chatField.value = ""
  };

  fetch(USERS_URL).then(res => res.json()).then(users => logIn(users))
});


function liveChatSocket(chatWebSocket) {
  chatWebSocket.onmessage = event => {
    const result = JSON.parse(event.data)
    // console.log("chatsocket", result)

    if (result["message"]["content"]) {
      const newMsg = result["message"]
      renderNewMessage(newMsg)
    }
  }
};

function liveUserSocket(userWebSocket) {
  userWebSocket.onmessage = event => {
    const result = JSON.parse(event.data)
    // console.log("usersocket", result)
    if (result["message"]["username"]) {
      //console.log(result["message"]["username"])
      const userArray = [...result["message"]["username"]]
      // console.log(userArray)
      renderOnlineUsers(userArray)
      //onlineCheck(userArray)
    }

    if (result["message"]["new_user"]) {
      renderJoinedMessage(result["message"]["new_user"])
      //audioJoin()
    }

    if (result["message"]["bye_user"]) {
      renderLeftMessage(result["message"]["bye_user"])
      //audioLeave()
    }
  }
}

function renderHomePage(currentUser) {
  const loginContainer = document.querySelector('#login-container');
  const profileMenu = document.querySelector('#profile-menu');
  const homeScreenContainer = document.querySelector('#home-screen-container');
  const welcomeMessage = document.querySelector('#welcome-message')
  loginContainer.style.display = "none";
  profileMenu.style.display = "inline";
  homeScreenContainer.style.display = "block";
  welcomeMessage.innerText = `What's the buzz, ${currentUser.username}?`
  welcomeMessage.style.display = "inline";
}

function renderChatHistory(messages) {
  const messageList = document.querySelector('#message-list')

  console.log(messages)

  for (const msg of messages) {
    const messageItem = document.createElement('div')
    const messageInfo = document.createElement('small')
    if (msg.user.username == currentUser.username) {
      messageItem.innerHTML = `<div class="user-message d-flex justify-content-end" channel-id="${msg.channel_id}">${msg.content}</div>`
      messageInfo.innerHTML = `<small class="user-message-info d-flex justify-content-end text-muted mb-4">${msg.user.username} - ${msg.created_at}</small>`
    } else {
      messageItem.innerHTML = `<div class="user-message d-flex justify-content-start" channel-id="${msg.channel_id}">${msg.content}</div>`
      messageInfo.innerHTML = `<small class="user-message-info d-flex justify-content-start text-muted mb-4">${msg.user.username} - ${msg.created_at}</small>`
    }
    messageItem.style.display = "none";
    messageItem.appendChild(messageInfo)
    messageList.appendChild(messageItem)
  }
}

function renderNewMessage(newMsg) {
  const messageList = document.querySelector('#message-list')
  const messageItem = document.createElement('div')
  const messageInfo = document.createElement('small')
  let sentTime = currentTime();
  console.log(newMsg)

  if (newMsg.user_id == currentUser.id) {
    messageItem.innerHTML = `<div class="user-message d-flex justify-content-end style=" channel-id="${newMsg.channel_id}">${newMsg.content}</div>`
    messageInfo.innerHTML = `<small class="user-message-info d-flex justify-content-end text-muted mb-4">${newMsg.username} - ${sentTime}</small>`
  } else {
    messageItem.innerHTML = `<div class="user-message d-flex justify-content-start" channel-id="${newMsg.channel_id}">${newMsg.content}</div>`
    messageInfo.innerHTML = `<small class="user-message-info d-flex justify-content-start text-muted mb-4">${newMsg.username} - ${sentTime}</small>`
  }
  messageItem.appendChild(messageInfo)
  messageList.appendChild(messageItem)
  scrollDown();
}

function renderChannelList(channels) {
  for (const channel of channels) {
    const currentMessageList = document.querySelector('#message-list').children;
    const channelList = document.querySelector('#channel-list');
    const channelItem = document.createElement('li');
    channelItem.className = "list-group-item"
    channelItem.innerText = channel.title
    channelItem.addEventListener("click", (event) => {
      for (message of currentMessageList) {
        message.style.display = "none"
      }
      currentChannel = channels.filter(c => c.title == channel.title)[0];
      var activeMessages = document.querySelectorAll(`div.user-message[channel-id="${channel.id}"]`);
      activeMessages.forEach(message => message.parentNode.style.display = "block");
    })
    channelList.appendChild(channelItem)
  }
}

function scrollDown() {
  const messageListScroll = document.querySelector("#message-list")
  messageListScroll.scrollTop = messageListScroll.scrollHeight
}

function currentTime() {
  var date = new Date();
  var weekday = date.toLocaleString("default", { weekday: "long" })
  var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
  var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  var am_pm = date.getHours() >= 12 ? "pm" : "am";

  var time = hours + ":" + minutes + am_pm + ", " + weekday;
  return time;
}

function renderOnlineUsers(userArray) {
  const userList = document.getElementById('user-list')
  let usernameArray = []
  userList.innerHTML = ""
  userArray.forEach(user => {
    usernameArray = usernameArray.concat(user.username)
  })
  usernameArray.sort().forEach(username => {
    const userItem = document.createElement('li')
    userItem.innerHTML = `
      <li class="user list-group-item">${username}</li>
    `
    userList.append(userItem)
  })
}

// <span style="color: #FC388E" class="user-list-text">
//     <img src='./imgs/ducky.svg' class="user-icon"/> ${username}
// </span>


