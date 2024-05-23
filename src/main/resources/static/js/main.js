'use strict';
window.onload = () => {


    const usernamePage = document.querySelector('#username-page');
    const chatPage = document.querySelector('#chat-page');
    const usernameForm = document.querySelector('#usernameForm');
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#message');
    const messageArea = document.querySelector('#messageArea');
    const connectingElement = document.querySelector('.connecting');

    let socket = null;
    let username = null;

    const colors = [
        '#2196F3', '#32c787', '#00BCD4', '#ff5652',
        '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
    ];

    function connect(event) {
        username = document.querySelector('#name').value.trim();

        if (username) {
            usernamePage.classList.add('hidden');
            chatPage.classList.remove('hidden');

            socket = new WebSocket(`ws://localhost:8080/chat?username=${username}`)// connection established
            socket.onmessage = onMessageReceived
            socket.onerror = onError

            connectingElement.classList.add('hidden');
        }

        event.preventDefault();
    }

    function onError(error) {
        connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
        connectingElement.style.color = 'red';
    }


    function sendMessage(event) {
        const messageContent = messageInput.value.trim();
        if (messageContent && socket) {
            const chatMessage = {
                sender: username,
                content: messageInput.value,
                type: 'CHAT'
            };
            socket.send(JSON.stringify(chatMessage));
            messageInput.value = '';
        }
        event.preventDefault();
    }


    function onMessageReceived(payload) {
        const message = JSON.parse(payload.data);

        const messageElement = document.createElement('li');

        if (message.type === 'JOIN') {
            messageElement.classList.add('event-message');
            message.content = message.sender + ' joined!';
        } else if (message.type === 'LEAVE') {
            messageElement.classList.add('event-message');
            message.content = message.sender + ' left!';
        } else {
            messageElement.classList.add('chat-message');

            const avatarElement = document.createElement('i');
            const avatarText = document.createTextNode(message.sender[0]);
            avatarElement.appendChild(avatarText);
            avatarElement.style['background-color'] = getAvatarColor(message.sender);

            messageElement.appendChild(avatarElement);

            const usernameElement = document.createElement('span');
            const usernameText = document.createTextNode(message.sender);
            usernameElement.appendChild(usernameText);
            messageElement.appendChild(usernameElement);
        }

        const textElement = document.createElement('p');
        const messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }


    function getAvatarColor(messageSender) {
        let hash = 0;
        for (let i = 0; i < messageSender.length; i++) {
            hash = 31 * hash + messageSender.charCodeAt(i);
        }
        const index = Math.abs(hash % colors.length);
        return colors[index];
    }

    usernameForm.addEventListener('submit', connect, true)
    messageForm.addEventListener('submit', sendMessage, true)
}