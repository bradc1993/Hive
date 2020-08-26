const BASE_URL = "http://localhost:3000"
const USERS_URL = `${BASE_URL}/users`
const CHANNELS_URL = `${BASE_URL}/channels`
const MESSAGES_URL = `${BASE_URL}/messages`

//this will be set to the current logged in User
let currentUser;
//this will be set to most recently clicked Channel
let currentChannel;


document.addEventListener("DOMContentLoaded", () => {
    console.log('%c DOM Content Loaded and Parsed!', 'color: magenta');

    //function to open new WebSocket via ActionCable
    function openConnection() {
        return new WebSocket("ws://localhost:3000/cable")
        console.log('success!')
    }

    //opening WebSocket for chat
    chatWebSocket = openConnection();
    chatWebSocket.onopen = (event) => {
        const subscribeMsg = { "command": "subscribe", "identifier": "{\"channel\":\"ChatMessagesChannel\"}" }
        chatWebSocket.send(JSON.stringify(subscribeMsg))
    }

    liveChatSocket(chatWebSocket);

    //GLOBAL VARIABLES
    loginContainer = document.getElementById('login-container');
    channelList = document.getElementById('channel-list');
    messageList = document.getElementById('message-list');
    chatField = document.getElementById('chat-field');
    sendBtn = document.getElementById('sendBtn');
    dropdownMenu = document.getElementById('dropdown-menu');
    viewProfileLink = document.getElementById('view-profile')
    editProfileLink = document.getElementById('edit-profile')
    logOutLink = document.getElementById('log-out')
    homeScreenContainer = document.getElementById('home-screen')
    viewProfileCol = document.getElementById('view-profile-col')
    viewProfile = document.getElementById('show-profile')
    editProfileScreen = document.getElementById('edit-profile-screen')
    createChannelForm = document.getElementById('create-channel-form')
    createChannelBtn = document.getElementById('create-channel-button')
    createAccountBtn = document.getElementById('create-account-btn')
    loginInput = document.getElementById('login-input')
    takeMeHome = document.getElementById('take-me-home')

    //SEND BUTTON LISTENER
    sendBtn.onclick = () => {
        event.preventDefault();

        const msg = {
            "command": "message",
            "identifier": "{\"channel\":\"ChatMessagesChannel\"}",
            "data": `{
                \"action\": \"send_text\",
                \"content\": \"${chatField.value}\",
                \"user\": {
                \"name\": \"${currentUser.name}\"
                }
            }`
        };

        console.log(msg)

        chatWebSocket.send(JSON.stringify(msg))
        chatField.value = ""
    }

    takeMeHome.onclick = () => {
        viewProfile.style.display = "none";
        renderHomePage(currentUser)
        
    }

    //SEND ALL USERS TO LOGIN
    fetch(USERS_URL).then(res => res.json()).then(users => logIn(users))
});


//chatWebSocket receives Message from chatField
function liveChatSocket(chatWebSocket) {
    chatWebSocket.onmessage = event => {
        const result = JSON.parse(event.data);
        console.log(event)
        //postNewMessage(result["message"])
        if (result["message"]["content"]) {
            //renderNewMessage(result["message"]["content"])
            postNewMessage(result["message"])
        }
    }
};




//LOGIN
function logIn(users) {
    const logInForm = document.getElementById('login-form');
    //const createAccountBtn = document.getElementById('create-account-btn');

    logInForm.addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        let nameInput = event.target.name.value;
        console.log(nameInput)
        let returnArray = users.filter(user => user.name === nameInput);
        currentUser = returnArray[0];
        console.log(currentUser);
        renderHomePage(currentUser);
    })

    createAccountBtn.addEventListener("click", () => {
        createAccount(loginInput.value)
    })

};

function createAccount(userName) {
    console.log(userName)
    fetch(USERS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": 'application/json'
        },
        body: JSON.stringify({
            name: userName
        })
    })
    alert('Account created! Please log in.')
    // const alert = document.createElement('div')
    // alert.innerHTML = `<div class="alert alert-light">Account created!</div>`

}



function renderHomePage(currentUser) {
    //HIDE LOGIN FORM/DISPLAY HOME PAGE ELEMENTS
    editProfileScreen.style.display = "none";
    loginContainer.style.display = "none";
    dropdownMenu.style.display = "inline";
    homeScreenContainer.style.display = "block";

    //PROFILE MENU EVENT LISTENERS
    viewProfileLink.addEventListener("click", (e) => {
        homeScreenContainer.style.display = "none";
        viewProfile.style.display = "inline";

        const profileName = document.createElement('h1')
        profileName.innerHTML = `Welcome, ${currentUser.name}!<br> <small>here is where your profile info would be :(</small>`
        viewProfileCol.appendChild(profileName)
    })
    //WIP
    editProfileLink.addEventListener("click", (e) => {
        homeScreenContainer.style.display = "none";
        editProfileScreen.style.display = "inline";
        
        const editForm = document.getElementById('edit-form')
        const editInput = document.getElementById('edit-name-input')
        
        editForm.addEventListener("submit", (e) => {
            event.preventDefault();

            console.log(editInput.value)
            fetch(USERS_URL + `/${currentUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    name: editInput.value
                })
            }).then(res => res.json()).then(response => console.log(response))
        })
    })
    logOutLink.addEventListener("click", () => {
        loginInput.value = ""
        homeScreenContainer.style.display = "none";
        editProfileScreen.style.display = "none";
        viewProfile.style.display = "none";
        dropdownMenu.style.display = "none"
        channelList.innerHTML = ""
        currentUser = ""

        loginContainer.style.display = "inline-flex";
    })


    //render channels the currentUser has messages in
    for (const channel of currentUser.channels) {
        const channelItem = document.createElement('li');
        channelItem.className = "list-group-item"
        channelItem.innerText = channel.title
        channelItem.addEventListener("click", (event) => {
            //fetch all messages, filter to channel clicked, then render
            currentChannel = channel;
            fetchAllMessages(channel);
        })
        //appending currentUser's channels
        channelList.appendChild(channelItem)
    }
}


//FETCH ALL MESSAGES FOR CHANNEL
function fetchAllMessages(currentChannel) {
    fetch(MESSAGES_URL)
        .then(res => res.json())
        .then(allMessages => filterMessagesToChannel(allMessages, currentChannel))
};


//MESSAGE TO CHANNEL FILTER
function filterMessagesToChannel(allMessages, channel) {
    messageList.innerHTML = "";

    let channelMessages = allMessages.filter(message => message.channel_id == currentChannel.id);
    renderMessages(channelMessages);
}


//RENDER MESSAGES
function renderMessages(channelMessages) {
    for (const message of channelMessages) {
        //const messageUser = channelMessages.filter(message => message.user_id == currentUser.id)

        const messageItem = document.createElement('div')
        const messageInfo = document.createElement('small')
        if (message.user.name == currentUser.name){
            messageItem.innerHTML = `
            <div class="user-message d-flex justify-content-end">${message.content}</div>`
            messageInfo.innerHTML = `<small class="user-message-info d-flex justify-content-end text-muted mb-4">${message.user.name} - ${message.created_at}</small>`
        } else {
            messageItem.innerHTML = `
            <div class="user-message d-flex justify-content-start">${message.content}</div>`
            messageInfo.innerHTML = `<small class="user-message-info d-flex justify-content-start text-muted mb-4">${message.user.name} - ${message.created_at}</small>`
        }
        
        messageItem.appendChild(messageInfo);
        messageList.appendChild(messageItem);
    }
}

function postNewMessage(message) {
    fetch(MESSAGES_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({
            content: message.content,
            user_id: currentUser.id,
            channel_id: currentChannel.id
        })
    }).then(currentChannel => fetchAllMessages(currentChannel));
}

function createChannel() {

}

// function renderNewMessage(content) {
//     const msg = `${currentUser.name}: ${content}`
//     const newMsg = document.createElement("p")
//     newMsg.innerHTML = msg
//     console.log(newMsg)
//     messageList.appendChild(newMsg)
// }


// function fetchAllChannels() {
//     fetch(CHANNELS_URL)
//         .then(res => res.json())
//         .then(channels => {
//             console.log(channels)
//             let uniqueChannels = [...new Set(channels)]
//             console.log(uniqueChannels)
//             renderChannels(channels)
//         })
// }

// function renderChannels(channels) {
//     console.log(channels)
//     const channelDiv = document.getElementById('channel-display')
//     const channelList = document.createElement('ul')
//     channels.forEach(channel => {
//         const channelListItem = document.createElement('li')
//         channelListItem.innerText = channel.title;
//         channelListItem.addEventListener("click", (event) => {
//             renderMessages(channel)
//         })
//         channelList.appendChild(channelListItem)
//     })
//     channelDiv.appendChild(channelList)
// }

// function renderMessages(channel){
//     const messageDiv = document.getElementById('message-display');
//     messageDiv.innerHTML = "";
//     const messageList = document.createElement('ul');
//     console.log(channel)
//     console.log(channel.messages)
//     channel.messages.forEach(message => {
//         const messageListItem = document.createElement('li')
//         messageListItem.innerHTML = `${message.content} <br> -${message.user}`
//         messageList.appendChild(messageListItem);
//     })
//     messageDiv.appendChild(messageList)
// }
